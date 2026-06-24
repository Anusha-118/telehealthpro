const request = require('supertest');
const app = require('../src/app');
const { Appointment, Patient, Doctor, Payment, Notification } = require('../src/models');

// Mock Sequelize Models
jest.mock('../src/models', () => {
  return {
    Appointment: {
      create: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn()
    },
    Patient: {
      findOne: jest.fn()
    },
    Doctor: {
      findByPk: jest.fn()
    },
    Payment: {
      create: jest.fn()
    },
    Notification: {
      create: jest.fn()
    }
  };
});

// Mock Auth Middleware to verify mock sessions
jest.mock('../src/middleware/auth.middleware', () => {
  return {
    protect: (req, res, next) => {
      req.user = { id: 1, email: 'jane@example.com', role: 'patient' };
      next();
    }
  };
});

describe('Appointments API Endpoint Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/appointments', () => {
    it('should create a pending appointment slot when parameters are valid', async () => {
      Patient.findOne.mockResolvedValue({ patient_id: 10, user_id: 1 });
      Doctor.findByPk.mockResolvedValue({
        doctor_id: 5,
        verification_status: 'approved',
        consultation_fee: 100.00,
        User: { email: 'doctor@example.com' }
      });
      Appointment.findOne.mockResolvedValue(null); // No conflicts
      Appointment.create.mockResolvedValue({
        appointment_id: 42,
        patient_id: 10,
        doctor_id: 5,
        date: '2026-06-25',
        time: '10:00:00',
        status: 'pending'
      });

      const response = await request(app)
        .post('/api/appointments')
        .send({
          doctor_id: 5,
          date: '2026-06-25',
          time: '10:00:00'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Appointment booked successfully');
    });

    it('should reject bookings when there is an overlapping slot reservation', async () => {
      Patient.findOne.mockResolvedValue({ patient_id: 10, user_id: 1 });
      Doctor.findByPk.mockResolvedValue({
        doctor_id: 5,
        verification_status: 'approved'
      });
      Appointment.findOne.mockResolvedValue({ appointment_id: 11 }); // Conflict exists

      const response = await request(app)
        .post('/api/appointments')
        .send({
          doctor_id: 5,
          date: '2026-06-25',
          time: '10:00:00'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });
});
