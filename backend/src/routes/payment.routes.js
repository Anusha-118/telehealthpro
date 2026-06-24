const express = require('express');
const router = express.Router();
const { checkoutSession, confirmPayment, getPaymentHistory, refundPaymentIntent } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.post('/checkout', authorize('patient'), checkoutSession);
router.post('/confirm', authorize('patient'), confirmPayment);
router.get('/history', authorize('patient', 'doctor'), getPaymentHistory);
router.post('/:paymentId/refund', authorize('admin'), refundPaymentIntent);

module.exports = router;
