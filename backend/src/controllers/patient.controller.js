const { Patient, User, Appointment, Prescription, MedicalReport, Doctor } = require('../models');
const { sequelize } = require('../config/db.config');

const getProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, attributes: ['name', 'email', 'role'] }]
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    console.error('Get Patient Profile Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
};

const updateProfile = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, age, gender, address, blood_group } = req.body;

    const patient = await Patient.findOne({ where: { user_id: req.user.id } });
    if (!patient) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    // 1. Update user table (name)
    if (name) {
      await User.update({ name }, { where: { id: req.user.id }, transaction });
    }

    // 2. Update patient table
    await Patient.update(
      { age, gender, address, blood_group },
      { where: { user_id: req.user.id }, transaction }
    );

    await transaction.commit();

    // Fetch updated data
    const updatedPatient = await Patient.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, attributes: ['name', 'email'] }]
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updatedPatient
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Update Patient Profile Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

const getMedicalHistory = async (req, res) => {
  try {
    const patient = await Patient.findOne({ where: { user_id: req.user.id } });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    // Fetch past completed appointments with prescription & doctor details
    const appointments = await Appointment.findAll({
      where: { patient_id: patient.patient_id },
      include: [
        {
          model: Doctor,
          include: [{ model: User, attributes: ['name', 'email'] }]
        },
        { model: Prescription }
      ],
      order: [['date', 'DESC'], ['time', 'DESC']]
    });

    // Fetch medical reports
    const reports = await MedicalReport.findAll({
      where: { patient_id: patient.patient_id },
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        appointments,
        reports
      }
    });
  } catch (error) {
    console.error('Get Medical History Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve medical history.' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getMedicalHistory
};
