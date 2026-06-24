const { Doctor, User, Appointment, Payment, Patient } = require('../models');
const { sequelize } = require('../config/db.config');
const { Op } = require('sequelize');

const getProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, attributes: ['name', 'email', 'role'] }]
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    console.error('Get Doctor Profile Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
};

const updateProfile = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, specialization, qualification, experience, consultation_fee } = req.body;

    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    if (!doctor) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    // 1. Update user table (name)
    if (name) {
      await User.update({ name }, { where: { id: req.user.id }, transaction });
    }

    // 2. Update doctor table
    await Doctor.update(
      { specialization, qualification, experience, consultation_fee },
      { where: { user_id: req.user.id }, transaction }
    );

    await transaction.commit();

    const updatedDoctor = await Doctor.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, attributes: ['name', 'email'] }]
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updatedDoctor
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Update Doctor Profile Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

// Public directory search
const listDoctors = async (req, res) => {
  try {
    const { specialization, search } = req.query;
    const whereClause = { verification_status: 'approved' };

    if (specialization) {
      whereClause.specialization = { [Op.like]: `%${specialization}%` };
    }

    const userWhereClause = {};
    if (search) {
      userWhereClause.name = { [Op.like]: `%${search}%` };
    }

    const doctors = await Doctor.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          where: userWhereClause,
          attributes: ['name', 'email']
        }
      ]
    });

    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    console.error('List Doctors Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve doctors.' });
  }
};

// Public detail page
const getDoctorDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByPk(id, {
      include: [{ model: User, attributes: ['name', 'email'] }]
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    console.error('Get Doctor Details Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve doctor details.' });
  }
};

// Earnings analytics dashboard
const getEarnings = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    // Fetch payments associated with this doctor's appointments
    const completedPayments = await Payment.findAll({
      where: { payment_status: 'paid' },
      include: [
        {
          model: Appointment,
          where: { doctor_id: doctor.doctor_id, status: 'completed' },
          include: [
            {
              model: Patient,
              include: [{ model: User, attributes: ['name'] }]
            }
          ]
        }
      ]
    });

    // Sum earnings
    let totalEarnings = 0;
    completedPayments.forEach((p) => {
      totalEarnings += parseFloat(p.amount);
    });

    // Form monthly breakdown (simple aggregation in JS for database portability)
    const monthlyData = {};
    completedPayments.forEach((p) => {
      const month = new Date(p.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyData[month] = (monthlyData[month] || 0) + parseFloat(p.amount);
    });

    const monthlyAnalytics = Object.keys(monthlyData).map((month) => ({
      month,
      amount: monthlyData[month]
    }));

    res.status(200).json({
      success: true,
      data: {
        totalEarnings,
        monthlyAnalytics,
        transactions: completedPayments
      }
    });
  } catch (error) {
    console.error('Get Doctor Earnings Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve earnings.' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  listDoctors,
  getDoctorDetails,
  getEarnings
};
