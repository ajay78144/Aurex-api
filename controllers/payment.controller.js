const razorpay = require('../config/razorpay');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { verifyPaymentSignature } = require('../utils/razorpayHelper');

// Create Razorpay Order
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', orderId } = req.body;

    const options = {
      amount: Math.round(amount * 100), // paise
      currency,
      receipt: `receipt_${orderId || Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create pending payment record
    const payment = await Payment.create({
      user: req.user.id,
      order: orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: amount,
      currency,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        paymentId: payment._id,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Payment
const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      // Mark payment as failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: 'failed', razorpayPaymentId, razorpaySignature }
      );
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'success',
      },
      { new: true }
    );

    // Update order payment status
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        orderStatus: 'Confirmed',
        $push: {
          timeline: {
            status: 'Confirmed',
            timestamp: new Date(),
            message: 'Payment received and order confirmed',
          },
        },
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: { payment },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Payment History
const getPaymentHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const payments = await Payment.find({ user: req.params.userId })
      .populate('order', 'orderStatus totalAmount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments({ user: req.params.userId });

    res.json({
      success: true,
      data: {
        payments: payments.map(p => ({
          paymentId: p.razorpayPaymentId,
          razorpayOrderId: p.razorpayOrderId,
          orderId: p.order,
          amount: p.amount,
          currency: p.currency,
          status: p.status,
          date: p.createdAt,
        })),
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createRazorpayOrder, verifyPayment, getPaymentHistory };
