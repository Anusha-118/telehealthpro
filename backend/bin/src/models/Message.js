const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Message = sequelize.define('Message', {
  message_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'messages',
  updatedAt: false // Chat messages only need createdAt
});

module.exports = Message;
