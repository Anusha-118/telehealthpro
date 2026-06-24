const http = require('http');
const app = require('./app');
const { sequelize, checkConnection } = require('./config/db.config');
const { initSocket } = require('./services/socket.service');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Bind Socket.io and expose the server-wide 'io' instance
const io = initSocket(server);
app.set('io', io);

const startServer = async () => {
  try {
    // 1. Establish and check DB connection
    await checkConnection();

    // 2. Sync database schema models (automatically creates tables if they do not exist)
    // In production, we'd use migrations, but force: false is standard for dev/demonstration.
    await sequelize.sync({ force: false });
    console.log('Database synced successfully.');

    // Auto-seed doctor accounts if empty
    const { seedDoctors } = require('./services/seed.service');
    await seedDoctors();

    // 3. Start server listener
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    });
  } catch (error) {
    console.error('Server startup failure:', error.message);
    process.exit(1);
  }
};

startServer();
