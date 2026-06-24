const express = require('express');
const router = express.Router();
const { createPrescription, getPrescription } = require('../controllers/prescription.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.post('/', authorize('doctor'), createPrescription);
router.get('/appointment/:appointmentId', getPrescription);

module.exports = router;
