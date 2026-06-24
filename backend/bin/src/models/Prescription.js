const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Prescription = sequelize.define('Prescription', {
  prescription_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  appointment_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  medicines: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'prescriptions'
});

module.exports = Prescription;
