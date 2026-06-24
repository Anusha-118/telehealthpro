const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// 1. Security Headers (Helmet)
// Customize content security policy for local uploads & external media resources
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// 2. CORS configurations
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// 3. Rate Limiting (Prevent Brute-Force & DOS attacks)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiter to standard API endpoints
app.use('/api', apiLimiter);

// 4. Body parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Static Files configuration (Serving mock file uploads)
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// 6. Routes bindings (We will create these router files in the subsequent steps)
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/patients', require('./routes/patient.routes'));
app.use('/api/doctors', require('./routes/doctor.routes'));
app.use('/api/appointments', require('./routes/appointment.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/reports', require('./routes/report.routes'));
app.use('/api/prescriptions', require('./routes/prescription.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// 7. Base Check Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TeleHealth Pro API Server is running.'
  });
});

// 8. Global Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error Log:', err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
