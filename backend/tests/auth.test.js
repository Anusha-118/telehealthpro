const request = require('supertest');
const app = require('../src/app');
const { User, Patient, Doctor } = require('../src/models');

// Mock Sequelize Models to bypass database engine requirements
jest.mock('../src/models', () => {
  return {
    User: {
      findOne: jest.fn(),
      create: jest.fn()
    },
    Patient: {
      create: jest.fn(),
      findOne: jest.fn()
    },
    Doctor: {
      create: jest.fn(),
      findOne: jest.fn()
    }
  };
});

describe('Authentication API Endpoint Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new patient successfully', async () => {
      // Mock unique user checks
      User.findOne.mockResolvedValue(null);
      // Mock user creation response
      const mockCreatedUser = {
        id: 1,
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'patient'
      };
      User.create.mockResolvedValue(mockCreatedUser);
      Patient.create.mockResolvedValue({ patient_id: 10, user_id: 1 });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
          role: 'patient'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user.name).toBe('Jane Doe');
      expect(response.body.tokens).toHaveProperty('accessToken');
    });

    it('should reject registrations with missing email/password parameters', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          role: 'patient'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate user and return tokens', async () => {
      const mockUser = {
        id: 1,
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'patient',
        comparePassword: jest.fn().mockResolvedValue(true)
      };
      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.tokens).toHaveProperty('accessToken');
    });
  });
});
