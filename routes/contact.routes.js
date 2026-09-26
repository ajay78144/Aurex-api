const express = require('express');
const router = express.Router();
const {
  createMessage,
  getMessages,
  getMessageById,
  replyToContact,
  deleteMessage,
} = require('../controllers/contact.controller');
const protect = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/admin.js');

// Public
router.post('/', createMessage);

// Admin only
router.get('/', protect, isAdmin, getMessages);
router.get('/:id', protect, isAdmin, getMessageById);
router.put('/:id/reply', protect, isAdmin, replyToContact);
router.delete('/:id', protect, isAdmin, deleteMessage);

module.exports = router;