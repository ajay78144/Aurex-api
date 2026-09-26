const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  deleteOrder,
  updateOrder,
  getOrdersByUserId,
  updateOrderStatus,
  cancelOrder,
  returnOrder,
  trackOrder,
} = require('../controllers/order.controller');
const protect = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/admin.js');

// Public / user routes
router.post('/', createOrder);
router.get('/user/:userId', getOrdersByUserId);
router.get('/:id/track', trackOrder);

// Admin routes
router.get('/', protect, isAdmin, getOrders);
router.put('/:id/status', protect, isAdmin, updateOrderStatus);

// User protected routes
router.get('/:id', getOrderById);
router.delete('/:id', deleteOrder);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/return', protect, returnOrder);
router.put('/:id', updateOrder);

module.exports = router;