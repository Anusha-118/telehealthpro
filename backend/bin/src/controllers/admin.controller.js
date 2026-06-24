const { User, Doctor, Patient, Appointment, Payment, Notification } = require('../models');
const { notifyUser } = require('../services/socket.service');
const { sendEmail } = require('../services/email.service');
const { sequelize } = require('../config/db.config');

const getDashboardStats = async (req, res) => {
  try {
    // 1. Core counters
    const totalPatients = await Patient.count();
    const totalDoctors = await Doctor.count();
    const totalAppointments = await Appointment.count();

    // 2. Financial total
    const revenueResult = await Payment.findAll({
      attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'totalRevenue']],
      where: { payment_status: 'paid' },
      raw: true
    });
    const totalRevenue = parseFloat(revenueResult[0].totalRevenue || 0);

    // 3. Lists for dashboards
    const recentPayments = await Payment.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Appointment,
          include: [
            { model: Patient, include: [{ model: User, attributes: ['name'] }] },
            { model: Doctor, include: [{ model: User, attributes: ['name'] }] }
          ]
        }
      ]
    });

    const recentAppointments = await Appointment.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        { model: Patient, include: [{ model: User, attributes: ['name'] }] },
        { model: Doctor, include: [{ model: User, attributes: ['name'] }] }
      ]
    });

    // 4. Analytics trends (Revenue, users, appointments)
    const appointmentsByStatus = await Appointment.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('appointment_id')), 'count']],
      group: ['status'],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalPatients,
          totalDoctors,
          totalAppointments,
          totalRevenue
        },
        recentPayments,
        recentAppointments,
        appointmentsByStatus
      }
    });
  } catch (error) {
    console.error('Get Admin Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve stats.' });
  }
};

const listDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    console.error('Admin List Doctors Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve doctors.' });
  }
};

const toggleDoctorVerification = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status state.' });
    }

    const doctor = await Doctor.findByPk(doctorId, {
      include: [{ model: User, attributes: ['name', 'email', 'id'] }]
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    doctor.verification_status = status;
    await doctor.save();

    // Notify doctor
    const alertTitle = `Registration Status: ${status.toUpperCase()}`;
    const alertMsg = `Admin has updated your verification status to: ${status}. ${
      status === 'approved' 
        ? 'You can now accept consultations!' 
        : 'Please verify your credentials or contact support.'
    }`;

    const notification = await Notification.create({
      user_id: doctor.User.id,
      title: alertTitle,
      message: alertMsg
    });

    // Realtime push
    const io = req.app.get('io');
    notifyUser(io, doctor.User.id, notification);

    // Email
    await sendEmail({
      to: doctor.User.email,
      subject: alertTitle,
      text: alertMsg,
      html: `<p>${alertMsg}</p>`
    });

    res.status(200).json({
      success: true,
      message: `Doctor status updated to ${status} successfully.`,
      data: doctor
    });
  } catch (error) {
    console.error('Verify Doctor Error:', error);
    res.status(500).json({ success: false, message: 'Failed to process verification.' });
  }
};

const listPatients = async (req, res) => {
  try {
    const patients = await Patient.findAll({
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ success: true, data: patients });
  } catch (error) {
    console.error('Admin List Patients Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve patients.' });
  }
};

module.exports = {
  getDashboardStats,
  listDoctors,
  toggleDoctorVerification,
  listPatients
};
