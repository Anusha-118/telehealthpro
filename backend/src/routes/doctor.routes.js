const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, listDoctors, getDoctorDetails, getEarnings } = require('../controllers/doctor.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Public routes (used by patients to search and view doctors)
router.get('/', listDoctors);
router.get('/profile/:id', getDoctorDetails);

// Private routes (doctor authenticated only)
router.get('/me', protect, authorize('doctor'), getProfile);
router.put('/me', protect, authorize('doctor'), updateProfile);
router.get('/earnings', protect, authorize('doctor'), getEarnings);

module.exports = router;
