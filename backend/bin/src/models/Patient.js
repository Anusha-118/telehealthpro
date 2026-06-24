const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Patient = sequelize.define('Patient', {
  patient_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  gender: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  blood_group: {
    type: DataTypes.STRING(10),
    allowNull: true
  }
}, {
  tableName: 'patients'
});

module.exports = Patient;
