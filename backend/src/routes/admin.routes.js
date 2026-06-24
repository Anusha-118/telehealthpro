const express = require('express');
const router = express.Router();
const { getDashboardStats, listDoctors, toggleDoctorVerification, listPatients } = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/doctors', listDoctors);
router.put('/doctors/:doctorId/verify', toggleDoctorVerification);
router.get('/patients', listPatients);

module.exports = router;
