const { Prescription, Appointment, Doctor, Patient, User } = require('../models');
const { notifyUser } = require('../services/socket.service');

const createPrescription = async (req, res) => {
  try {
    const { appointment_id, medicines, notes } = req.body;

    if (!appointment_id || !medicines) {
      return res.status(400).json({ success: false, message: 'Appointment ID and medicines list are required.' });
    }

    // 1. Verify doctor authorization for this appointment
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    if (!doctor) {
      return res.status(403).json({ success: false, message: 'Only registered doctors can create prescriptions.' });
    }

    const appointment = await Appointment.findByPk(appointment_id, {
      include: [{ model: Patient, include: [{ model: User, attributes: ['id', 'name'] }] }]
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (appointment.doctor_id !== doctor.doctor_id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to prescribe for this appointment.' });
    }

    // 2. Create or Update Prescription
    let prescription = await Prescription.findOne({ where: { appointment_id } });

    if (prescription) {
      prescription.medicines = medicines;
      prescription.notes = notes;
      await prescription.save();
    } else {
      prescription = await Prescription.create({
        appointment_id,
        medicines,
        notes
      });
    }

    // 3. Mark appointment as completed when prescription is uploaded
    appointment.status = 'completed';
    await appointment.save();

    // 4. Notify patient
    const io = req.app.get('io');
    notifyUser(io, appointment.Patient.User.id, {
      title: 'New Prescription Uploaded',
      message: `Doctor has uploaded your prescription details for appointment on ${appointment.date}.`
    });

    res.status(201).json({
      success: true,
      message: 'Prescription processed successfully and appointment marked as completed.',
      data: prescription
    });
  } catch (error) {
    console.error('Create Prescription Error:', error);
    res.status(500).json({ success: false, message: 'Failed to process prescription.' });
  }
};

const getPrescription = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const prescription = await Prescription.findOne({
      where: { appointment_id: appointmentId },
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

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }

    // Ensure requesting user is authorized (is the patient, the doctor, or an admin)
    const userId = req.user.id;
    const isPatientUser = prescription.Appointment.Patient.user_id === userId;
    const isDoctorUser = prescription.Appointment.Doctor.user_id === userId;
    const isAdminUser = req.user.role === 'admin';

    if (!isPatientUser && !isDoctorUser && !isAdminUser) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this prescription.' });
    }

    res.status(200).json({ success: true, data: prescription });
  } catch (error) {
    console.error('Get Prescription Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve prescription.' });
  }
};

module.exports = {
  createPrescription,
  getPrescription
};
