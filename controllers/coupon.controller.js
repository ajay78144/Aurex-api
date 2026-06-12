const Coupon = require("../models/Coupon");

// Create Coupon
const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Coupons
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();

    res.json(coupons);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Coupon By ID
const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Coupon
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(coupon);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Coupon
const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);

    res.json({
      message: "Coupon deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
};