const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRevenueChart,
  getTopProducts,
  getRecentOrders,
  getSalesReport,
} = require('../controllers/dashboard.controller');
const protect = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/admin.js');

// All dashboard routes are admin only
router.use(protect, isAdmin);

router.get('/', getDashboardStats);
router.get('/stats', getDashboardStats);
router.get('/revenue-chart', getRevenueChart);
router.get('/top-products', getTopProducts);
router.get('/recent-orders', getRecentOrders);
router.get('/sales-report', getSalesReport);

module.exports = router;