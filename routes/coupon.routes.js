const express = require('express');
const router = express.Router();
const {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  toggleCoupon,
  validateCoupon,
} = require('../controllers/coupon.controller');
const protect = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/admin.js');

// Public
router.get('/', getCoupons);
router.post('/validate', validateCoupon);
router.get('/:id', getCouponById);

// Admin only
router.post('/', protect, isAdmin, createCoupon);
router.put('/:id/toggle', protect, isAdmin, toggleCoupon);
router.put('/:id', protect, isAdmin, updateCoupon);
router.delete('/:id', protect, isAdmin, deleteCoupon);

module.exports = router;