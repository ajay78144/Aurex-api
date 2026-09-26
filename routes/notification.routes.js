const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendNotification,
} = require('../controllers/notification.controller');
const protect = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/admin.js');

router.get('/user/:userId', protect, getUserNotifications);
router.get('/unread-count/:userId', protect, getUnreadCount);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all/:userId', protect, markAllAsRead);
router.delete('/:id', protect, deleteNotification);
router.post('/send', protect, isAdmin, sendNotification);

module.exports = router;
