const Coupon = require('../models/Coupon');

// Create Coupon
const createCoupon = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.code) data.code = data.code.toUpperCase();
    const coupon = await Coupon.create(data);
    res.status(201).json({ success: true, message: 'Coupon created', data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Coupons
const getCoupons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const coupons = await Coupon.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Coupon.countDocuments();

    res.json({ success: true, data: { coupons, total, page, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Coupon By ID
const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Coupon
const updateCoupon = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.code) data.code = data.code.toUpperCase();
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, message: 'Coupon updated', data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Coupon
const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle Coupon Active/Inactive
const toggleCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

    coupon.isActive = !coupon.isActive;
    coupon.active = coupon.isActive;
    await coupon.save();

    res.json({
      success: true,
      message: `Coupon ${coupon.isActive ? 'enabled' : 'disabled'}`,
      data: coupon,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Validate Coupon
const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    const coupon = await Coupon.findOne({ code: code?.toUpperCase() });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });

    if (!coupon.isActive && !coupon.active) {
      return res.status(400).json({ success: false, message: 'Coupon is inactive' });
    }

    const expiryDate = coupon.expiresAt || coupon.expiryDate;
    if (expiryDate && new Date(expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    const amount = orderAmount || 0;
    const minAmount = coupon.minOrderAmount || 0;
    if (amount < minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${minAmount} required`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    const discountValue = coupon.value || coupon.discount || 0;
    if (coupon.type === 'percentage') {
      discountAmount = (amount * discountValue) / 100;
      if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    } else {
      discountAmount = discountValue;
    }

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        code: coupon.code,
        type: coupon.type || 'fixed',
        value: discountValue,
        discountAmount: Math.round(discountAmount),
        finalAmount: Math.max(0, amount - discountAmount),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  toggleCoupon,
  validateCoupon,
};