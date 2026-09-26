const Contact = require('../models/Contact');
const { sendContactReplyEmail } = require('../utils/email');

// Create Message
const createMessage = async (req, res) => {
  try {
    const message = await Contact.create(req.body);
    res.status(201).json({ success: true, message: 'Message sent', data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Messages
const getMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const messages = await Contact.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments();
    res.json({ success: true, data: { messages, total, page, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Message
const getMessageById = async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reply to Contact (Admin)
const replyToContact = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Message not found' });

    // Send reply email
    try {
      await sendContactReplyEmail(contact, replyMessage);
    } catch (emailErr) {
      console.error('Email error:', emailErr.message);
    }

    // Mark as replied
    contact.isReplied = true;
    contact.replyMessage = replyMessage;
    contact.repliedAt = new Date();
    await contact.save();

    res.json({ success: true, message: 'Reply sent successfully', data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Message
const deleteMessage = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createMessage,
  getMessages,
  getMessageById,
  replyToContact,
  deleteMessage,
};