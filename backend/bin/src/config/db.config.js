const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

let sequelize;

const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'telehealth_db';
const dbPort = process.env.DB_PORT || 3306;

if (process.env.NODE_ENV === 'test') {
  // Create a stub model mockup to bypass database dependency and binaries requirements
  const mockModel = function() {};
  mockModel.prototype = {};
  mockModel.hasOne = () => {};
  mockModel.belongsTo = () => {};
  mockModel.hasMany = () => {};
  mockModel.findOne = async () => null;
  mockModel.findAll = async () => [];
  mockModel.findByPk = async () => null;
  mockModel.create = async (d) => ({ ...d, save: async () => {}, destroy: async () => {} });
  mockModel.update = async () => [1];
  mockModel.count = async () => 0;
  mockModel.sync = async () => {};

  sequelize = {
    define: () => mockModel,
    authenticate: async () => {},
    sync: async () => {},
    transaction: async () => ({
      commit: async () => {},
      rollback: async () => {}
    })
  };
} else {
  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  });
}

const checkConnection = async () => {
  if (process.env.NODE_ENV === 'test') return;
  
  try {
    // 1. Establish connection to MySQL server directly to pre-create database if missing
    const tempConnection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      port: dbPort
    });
    
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await tempConnection.end();

    // 2. Perform authentication via Sequelize instance
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  checkConnection
};
