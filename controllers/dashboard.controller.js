const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const Banner = require('../models/Banner');
const Contact = require('../models/Contact');

// Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalUsers,
      totalProducts,
      totalCategories,
      totalOrders,
      totalReviews,
      totalCartItems,
      totalCoupons,
      totalBanners,
      totalContacts,
      todayOrders,
      pendingOrders,
      deliveredOrders,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Category.countDocuments(),
      Order.countDocuments(),
      Review.countDocuments(),
      Cart.countDocuments(),
      Coupon.countDocuments(),
      Banner.countDocuments(),
      Contact.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Order.countDocuments({ orderStatus: { $in: ['Pending', 'pending'] } }),
      Order.countDocuments({ orderStatus: { $in: ['Delivered', 'delivered'] } }),
    ]);

    const orders = await Order.find();
    let totalRevenue = 0;
    let todayRevenue = 0;
    orders.forEach(order => {
      const amount = Number(order.totalAmount || order.totalPrice || 0);
      totalRevenue += amount;
      if (new Date(order.createdAt) >= startOfToday) todayRevenue += amount;
    });

    const latestUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(5);
    const latestOrders = await Order.find()
      .populate('customer', 'name email')
      .populate('products.product', 'name images price')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
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
        todayOrders,
        todayRevenue,
        pendingOrders,
        deliveredOrders,
        latestUsers,
        latestOrders,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Revenue Chart
const getRevenueChart = async (req, res) => {
  try {
    const period = req.query.period || 'monthly';
    const now = new Date();
    let labels = [];
    let data = [];

    if (period === 'weekly') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        const orders = await Order.find({ createdAt: { $gte: dayStart, $lt: dayEnd } });
        const revenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
        labels.push(date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }));
        data.push(revenue);
      }
    } else if (period === 'monthly') {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        const orders = await Order.find({ createdAt: { $gte: date, $lt: nextDate } });
        const revenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
        labels.push(date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }));
        data.push(revenue);
      }
    } else if (period === 'yearly') {
      // Last 5 years
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i;
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year + 1, 0, 1);
        const orders = await Order.find({ createdAt: { $gte: yearStart, $lt: yearEnd } });
        const revenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
        labels.push(String(year));
        data.push(revenue);
      }
    }

    res.json({ success: true, data: { labels, data } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Top Products
const getTopProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const orders = await Order.find({ orderStatus: { $nin: ['Cancelled', 'cancelled'] } })
      .populate('products.product', 'name images price');

    const productMap = {};
    orders.forEach(order => {
      order.products.forEach(item => {
        const id = item.product?._id?.toString();
        if (!id) return;
        if (!productMap[id]) {
          productMap[id] = { product: item.product, totalSold: 0, revenue: 0 };
        }
        productMap[id].totalSold += item.quantity || 0;
        productMap[id].revenue += (item.price || 0) * (item.quantity || 0);
      });
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit);

    res.json({ success: true, data: topProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Recent Orders
const getRecentOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const orders = await Order.find()
      .populate('customer', 'name email')
      .populate('products.product', 'name images price')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Sales Report
const getSalesReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    const orders = await Order.find(filter)
      .populate('customer', 'name email')
      .populate('products.product', 'name price')
      .sort({ createdAt: -1 });

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const totalOrders = orders.length;

    res.json({
      success: true,
      data: { orders, totalRevenue, totalOrders },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getRevenueChart,
  getTopProducts,
  getRecentOrders,
  getSalesReport,
};