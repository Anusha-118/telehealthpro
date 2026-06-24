const { Payment, Appointment, Patient, Doctor, User, Notification } = require('../models');
const { createPaymentIntent, refundPayment } = require('../services/stripe.service');
const { sendEmail } = require('../services/email.service');
const { notifyUser } = require('../services/socket.service');

const checkoutSession = async (req, res) => {
  try {
    const { appointment_id } = req.body;

    if (!appointment_id) {
      return res.status(400).json({ success: false, message: 'Appointment ID is required.' });
    }

    const appointment = await Appointment.findByPk(appointment_id, {
      include: [
        { model: Doctor, include: [{ model: User, attributes: ['name'] }] },
        { model: Patient, include: [{ model: User, attributes: ['name', 'email'] }] }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // 1. Get payment details
    const payment = await Payment.findOne({ where: { appointment_id } });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    if (payment.payment_status === 'paid') {
      return res.status(400).json({ success: false, message: 'Appointment has already been paid for.' });
    }

    // 2. Create Stripe Intent (converting dollars to cents)
    const amountInCents = Math.round(parseFloat(payment.amount) * 100);
    const intentResult = await createPaymentIntent(amountInCents, {
      appointment_id: appointment.appointment_id.toString(),
      patient_name: appointment.Patient.User.name
    });

    // 3. Update payment record
    payment.stripe_payment_intent_id = intentResult.id;
    await payment.save();

    res.status(200).json({
      success: true,
      clientSecret: intentResult.client_secret,
      paymentId: payment.payment_id,
      amount: payment.amount
    });
  } catch (error) {
    console.error('Checkout Session Error:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate payment session.' });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { appointment_id } = req.body;

    const appointment = await Appointment.findByPk(appointment_id, {
      include: [
        { model: Doctor, include: [{ model: User, attributes: ['name', 'user_id', 'id'] }] },
        { model: Patient, include: [{ model: User, attributes: ['name', 'email', 'user_id', 'id'] }] }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const payment = await Payment.findOne({ where: { appointment_id } });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    // Update payment status
    payment.payment_status = 'paid';
    await payment.save();

    // Confirm appointment status
    appointment.status = 'confirmed';
    await appointment.save();

    // 1. Notify Doctor about confirmed payment & appointment
    const alertTitle = 'Appointment Confirmed';
    const alertMsg = `Appointment with Patient ${appointment.Patient.User.name} on ${appointment.date} is confirmed (Paid).`;

    const notification = await Notification.create({
      user_id: appointment.Doctor.User.id,
      title: alertTitle,
      message: alertMsg
    });

    const io = req.app.get('io');
    notifyUser(io, appointment.Doctor.User.id, notification);

    // 2. Dispatch receipt / invoice email to patient
    await sendEmail({
      to: appointment.Patient.User.email,
      subject: `Invoice Receipt for Appointment #${appointment.appointment_id}`,
      text: `Thank you for booking! We have received your payment of $${payment.amount} for your consultation with Dr. ${appointment.Doctor.User.name} on ${appointment.date} at ${appointment.time}.`,
      html: `
        <h3>Invoice Receipt</h3>
        <p>Thank you for booking your consultation with TeleHealth Pro!</p>
        <p><strong>Appointment ID:</strong> #${appointment.appointment_id}</p>
        <p><strong>Doctor:</strong> Dr. ${appointment.Doctor.User.name}</p>
        <p><strong>Date:</strong> ${appointment.date}</p>
        <p><strong>Time:</strong> ${appointment.time}</p>
        <p><strong>Amount Paid:</strong> $${payment.amount} (USD)</p>
        <p><strong>Status:</strong> Paid</p>
      `
    });

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully.',
      data: payment
    });
  } catch (error) {
    console.error('Confirm Payment Error:', error);
    res.status(500).json({ success: false, message: 'Failed to confirm payment.' });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    let whereClause = {};

    // Filter by role
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { user_id: req.user.id } });
      if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });
      
      whereClause = {
        '$Appointment.patient_id$': patient.patient_id
      };
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
      if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

      whereClause = {
        '$Appointment.doctor_id$': doctor.doctor_id
      };
    }

    const history = await Payment.findAll({
      where: whereClause,
      include: [
        {
          model: Appointment,
          include: [
            { model: Patient, include: [{ model: User, attributes: ['name'] }] },
            { model: Doctor, include: [{ model: User, attributes: ['name'] }] }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error('Get Payment History Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve payment history.' });
  }
};

const refundPaymentIntent = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findByPk(paymentId, {
      include: [
        {
          model: Appointment,
          include: [
            { model: Patient, include: [{ model: User, attributes: ['name', 'email', 'id'] }] },
            { model: Doctor, include: [{ model: User, attributes: ['name'] }] }
          ]
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    if (payment.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Can only refund completed payments.' });
    }

    // 1. Process Stripe Refund
    if (payment.stripe_payment_intent_id) {
      await refundPayment(payment.stripe_payment_intent_id);
    }

    // 2. Update statuses
    payment.payment_status = 'refunded';
    await payment.save();

    payment.Appointment.status = 'cancelled';
    await payment.Appointment.save();

    // 3. Notify patient
    const alertTitle = 'Refund Processed';
    const alertMsg = `Your payment of $${payment.amount} for Appointment #${payment.Appointment.appointment_id} has been refunded.`;

    const notification = await Notification.create({
      user_id: payment.Appointment.Patient.User.id,
      title: alertTitle,
      message: alertMsg
    });

    const io = req.app.get('io');
    notifyUser(io, payment.Appointment.Patient.User.id, notification);

    await sendEmail({
      to: payment.Appointment.Patient.User.email,
      subject: alertTitle,
      text: alertMsg,
      html: `<p>${alertMsg}</p>`
    });

    res.status(200).json({ success: true, message: 'Refund successfully completed.', data: payment });
  } catch (error) {
    console.error('Refund Payment Error:', error);
    res.status(500).json({ success: false, message: 'Refund processing failed.' });
  }
};

module.exports = {
  checkoutSession,
  confirmPayment,
  getPaymentHistory,
  refundPaymentIntent
};
