const express = require('express');
const router = express.Router();
const { bookAppointment, listPatientAppointments, listDoctorAppointments, updateAppointmentStatus } = require('../controllers/appointment.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.post('/', protect, authorize('patient'), bookAppointment);
router.get('/patient', protect, authorize('patient'), listPatientAppointments);
router.get('/doctor', protect, authorize('doctor'), listDoctorAppointments);
router.put('/:id/status', protect, authorize('patient', 'doctor'), updateAppointmentStatus);

module.exports = router;
