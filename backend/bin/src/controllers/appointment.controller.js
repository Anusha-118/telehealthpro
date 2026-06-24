const { Appointment, Patient, Doctor, User, Payment, Prescription, Notification } = require('../models');
const { notifyUser } = require('../services/socket.service');
const { sendEmail } = require('../services/email.service');

const bookAppointment = async (req, res) => {
  try {
    const { doctor_id, date, time } = req.body;

    if (!doctor_id || !date || !time) {
      return res.status(400).json({ success: false, message: 'Doctor ID, date, and time are required.' });
    }

    // 1. Fetch Patient details
    const patient = await Patient.findOne({ where: { user_id: req.user.id } });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    // 2. Fetch Doctor details
    const doctor = await Doctor.findByPk(doctor_id, {
      include: [{ model: User, attributes: ['name', 'email'] }]
    });
    if (!doctor || doctor.verification_status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Selected doctor is not available or verified.' });
    }

    // 3. Prevent duplicate scheduling conflicts
    const conflict = await Appointment.findOne({
      where: {
        doctor_id,
        date,
        time,
        status: ['pending', 'confirmed']
      }
    });

    if (conflict) {
      return res.status(409).json({ success: false, message: 'The doctor already has an appointment booked at this slot.' });
    }

    // 4. Create appointment
    const appointment = await Appointment.create({
      patient_id: patient.patient_id,
      doctor_id,
      date,
      time,
      status: 'pending'
    });

    // 5. Pre-create payment record (pending payment)
    await Payment.create({
      appointment_id: appointment.appointment_id,
      amount: doctor.consultation_fee,
      payment_status: 'pending'
    });

    // 6. Notify Doctor (in-app notification, socket event, and email)
    const alertTitle = 'New Appointment Request';
    const alertMsg = `Patient ${req.user.name} has requested an appointment on ${date} at ${time}.`;

    const notification = await Notification.create({
      user_id: doctor.user_id,
      title: alertTitle,
      message: alertMsg
    });

    // Emit live push event
    const io = req.app.get('io');
    notifyUser(io, doctor.user_id, notification);

    // Dispatch email
    await sendEmail({
      to: doctor.User.email,
      subject: alertTitle,
      text: alertMsg,
      html: `<p>${alertMsg}</p>`
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully. Payment is pending.',
      data: appointment
    });
  } catch (error) {
    console.error('Book Appointment Error:', error);
    res.status(500).json({ success: false, message: 'Failed to book appointment.' });
  }
};

const listPatientAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ where: { user_id: req.user.id } });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    const appointments = await Appointment.findAll({
      where: { patient_id: patient.patient_id },
      include: [
        {
          model: Doctor,
          include: [{ model: User, attributes: ['name', 'email', 'id'] }]
        },
        { model: Payment },
        { model: Prescription }
      ],
      order: [['date', 'DESC'], ['time', 'DESC']]
    });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error('List Patient Appointments Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve appointments.' });
  }
};

const listDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    const appointments = await Appointment.findAll({
      where: { doctor_id: doctor.doctor_id },
      include: [
        {
          model: Patient,
          include: [{ model: User, attributes: ['name', 'email', 'id'] }]
        },
        { model: Payment },
        { model: Prescription }
      ],
      order: [['date', 'DESC'], ['time', 'DESC']]
    });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error('List Doctor Appointments Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve appointments.' });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status state.' });
    }

    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: Patient, include: [{ model: User, attributes: ['name', 'email', 'user_id', 'id'] }] },
        { model: Doctor, include: [{ model: User, attributes: ['name', 'email', 'user_id', 'id'] }] }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Role restrictions for updating state:
    // Patient can cancel. Doctor can confirm, complete, cancel.
    if (req.user.role === 'patient' && status !== 'cancelled') {
      return res.status(403).json({ success: false, message: 'Patients can only cancel appointments.' });
    }

    // Apply status update
    appointment.status = status;
    await appointment.save();

    // Trigger Notification for the other participant
    let targetUserId, targetEmail, alertTitle, alertMsg;
    if (req.user.role === 'patient') {
      // Patient updated status (cancelled it)
      targetUserId = appointment.Doctor.User.id;
      targetEmail = appointment.Doctor.User.email;
      alertTitle = 'Appointment Cancelled by Patient';
      alertMsg = `Appointment scheduled on ${appointment.date} was cancelled by Patient ${appointment.Patient.User.name}.`;
    } else {
      // Doctor updated status
      targetUserId = appointment.Patient.User.id;
      targetEmail = appointment.Patient.User.email;
      alertTitle = `Appointment status updated: ${status.toUpperCase()}`;
      alertMsg = `Doctor ${appointment.Doctor.User.name} has updated your appointment status to: ${status}.`;
    }

    const notification = await Notification.create({
      user_id: targetUserId,
      title: alertTitle,
      message: alertMsg
    });

    // Realtime push
    const io = req.app.get('io');
    notifyUser(io, targetUserId, notification);

    // Send email
    await sendEmail({
      to: targetEmail,
      subject: alertTitle,
      text: alertMsg,
      html: `<p>${alertMsg}</p>`
    });

    res.status(200).json({ success: true, message: 'Appointment status updated successfully.', data: appointment });
  } catch (error) {
    console.error('Update Appointment Status Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update appointment.' });
  }
};

module.exports = {
  bookAppointment,
  listPatientAppointments,
  listDoctorAppointments,
  updateAppointmentStatus
};
