const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getMedicalHistory } = require('../controllers/patient.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);
router.use(authorize('patient'));

router.get('/me', getProfile);
router.put('/me', updateProfile);
router.get('/history', getMedicalHistory);

module.exports = router;
