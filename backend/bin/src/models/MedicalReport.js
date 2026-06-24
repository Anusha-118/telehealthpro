const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const MedicalReport = sequelize.define('MedicalReport', {
  report_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  file_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'medical_reports'
});

module.exports = MedicalReport;
