const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
  getPaymentHistory,
} = require('../controllers/payment.controller');
const protect = require('../middleware/auth.middleware');

router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);
router.get('/history/:userId', protect, getPaymentHistory);

module.exports = router;
