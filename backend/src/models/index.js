const { sequelize } = require('../config/db.config');
const User = require('./User');
const Patient = require('./Patient');
const Doctor = require('./Doctor');
const Appointment = require('./Appointment');
const MedicalReport = require('./MedicalReport');
const Prescription = require('./Prescription');
const Payment = require('./Payment');
const Notification = require('./Notification');
const Message = require('./Message');

// 1. User <-> Patient (1 to 1)
User.hasOne(Patient, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Patient.belongsTo(User, { foreignKey: 'user_id' });

// 2. User <-> Doctor (1 to 1)
User.hasOne(Doctor, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Doctor.belongsTo(User, { foreignKey: 'user_id' });

// 3. Patient <-> Appointment (1 to Many)
Patient.hasMany(Appointment, { foreignKey: 'patient_id', onDelete: 'CASCADE' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id' });

// 4. Doctor <-> Appointment (1 to Many)
Doctor.hasMany(Appointment, { foreignKey: 'doctor_id', onDelete: 'CASCADE' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctor_id' });

// 5. Patient <-> MedicalReport (1 to Many)
Patient.hasMany(MedicalReport, { foreignKey: 'patient_id', onDelete: 'CASCADE' });
MedicalReport.belongsTo(Patient, { foreignKey: 'patient_id' });

// 6. Appointment <-> Prescription (1 to 1)
Appointment.hasOne(Prescription, { foreignKey: 'appointment_id', onDelete: 'CASCADE' });
Prescription.belongsTo(Appointment, { foreignKey: 'appointment_id' });

// 7. Appointment <-> Payment (1 to 1)
Appointment.hasOne(Payment, { foreignKey: 'appointment_id', onDelete: 'CASCADE' });
Payment.belongsTo(Appointment, { foreignKey: 'appointment_id' });

// 8. User <-> Notification (1 to Many)
User.hasMany(Notification, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// 9. User <-> Message (sender / receiver relations)
User.hasMany(Message, { foreignKey: 'sender_id', as: 'SentMessages', onDelete: 'CASCADE' });
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'ReceivedMessages', onDelete: 'CASCADE' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'Sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'Receiver' });

module.exports = {
  sequelize,
  User,
  Patient,
  Doctor,
  Appointment,
  MedicalReport,
  Prescription,
  Payment,
  Notification,
  Message
};
