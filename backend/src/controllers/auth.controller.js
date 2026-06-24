const { User, Patient, Doctor } = require('../models');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET || 'telehealthsecretkeyfortokens',
    { expiresIn: process.env.JWT_EXPIRE || '1d' }
  );
  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || 'telehealthrefreshsecretkeyfortokens',
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
  return { accessToken, refreshToken };
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Input Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (!['patient', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid user role.' });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    // 3. Create User
    const user = await User.create({ name, email, password, role });

    // 4. Create Role-Specific Profiles
    let profileId = null;
    if (role === 'patient') {
      const patient = await Patient.create({ user_id: user.id });
      profileId = patient.patient_id;
    } else if (role === 'doctor') {
      const doctor = await Doctor.create({ 
        user_id: user.id,
        verification_status: 'pending' // default state
      });
      profileId = doctor.doctor_id;
    }

    // 5. Respond
    const { accessToken, refreshToken } = generateTokens(user);
    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      tokens: { accessToken, refreshToken },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileId
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Registration failed due to server error.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Fetch related profile details
    let profileId = null;
    let doctorVerificationStatus = null;
    if (user.role === 'patient') {
      const patient = await Patient.findOne({ where: { user_id: user.id } });
      if (patient) profileId = patient.patient_id;
    } else if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { user_id: user.id } });
      if (doctor) {
        profileId = doctor.doctor_id;
        doctorVerificationStatus = doctor.verification_status;
      }
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      tokens: { accessToken, refreshToken },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileId,
        doctorVerificationStatus
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Login failed due to server error.' });
  }
};

const logout = async (req, res) => {
  // Stateless JWT doesn't strictly need a backend logout unless using denylists/refresh-cookies.
  // We simply acknowledge logout. The client will discard the tokens.
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token is required.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'telehealthrefreshsecretkeyfortokens');
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    const tokens = generateTokens(user);
    res.status(200).json({
      success: true,
      tokens
    });
  } catch (error) {
    console.error('Refresh Token Error:', error.message);
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken
};
