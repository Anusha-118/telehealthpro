const express = require('express');
const router = express.Router();
const { uploadReport, listReports, getReportDetails, deleteReport } = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

router.use(protect);

router.post('/', authorize('patient'), upload.single('report'), uploadReport);
router.get('/', authorize('patient'), listReports);
router.get('/:id', getReportDetails);
router.delete('/:id', authorize('patient'), deleteReport);

module.exports = router;
