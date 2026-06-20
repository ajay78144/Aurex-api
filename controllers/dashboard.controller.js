const User = require("../models/User");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Order = require("../models/Order");
const Review = require("../models/Review");
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");
const Banner = require("../models/Banner");
const Contact = require("../models/Contact");

const getDashboardStats = async (req, res) => {

  try {

    const totalUsers = await User.countDocuments();

    const totalProducts = await Product.countDocuments();

    const totalCategories = await Category.countDocuments();

    const totalOrders = await Order.countDocuments();

    const totalReviews = await Review.countDocuments();

    const totalCartItems = await Cart.countDocuments();

    const totalCoupons = await Coupon.countDocuments();

    const totalBanners = await Banner.countDocuments();

    const totalContacts = await Contact.countDocuments();

    const orders = await Order.find();

    let totalRevenue = 0;

    orders.forEach(order => {
      totalRevenue += Number(order.totalPrice || 0);
    });

    const latestUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    const latestOrders = await Order.find()
      .populate("customer")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({

      success: true,

      totalUsers,

      totalProducts,

      totalCategories,

      totalOrders,

      totalReviews,

      totalCartItems,

      totalCoupons,

      totalBanners,

      totalContacts,

      totalRevenue,

      latestUsers,

      latestOrders

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};

module.exports = {
  getDashboardStats
};