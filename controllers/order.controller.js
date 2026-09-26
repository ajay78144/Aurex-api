const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// Helper to normalize order data for frontend consumption
const normalizeOrder = (order) => {
  if (!order) return null;
  const orderObj = order.toObject ? order.toObject() : order;
  const name = orderObj.shippingAddress?.name || orderObj.shippingAddress?.fullName || '';
  const nameParts = name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const items = (orderObj.products || []).map(p => {
    let product = p.product;
    if (product && typeof product === 'object') {
      if (!product.images || product.images.length === 0 || !product.images[0]) {
        const categoryName = (product.category?.name || '').toLowerCase();
        let defaultImg = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600';
        if (categoryName.includes('shirt') || categoryName.includes('tshirt') || categoryName.includes('wear') || categoryName.includes('cloth') || categoryName.includes('pant') || categoryName.includes('jeans')) {
          defaultImg = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600';
        } else if (categoryName.includes('shoe') || categoryName.includes('sneaker') || categoryName.includes('footwear')) {
          defaultImg = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600';
        } else if (categoryName.includes('watch')) {
          defaultImg = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';
        } else if (categoryName.includes('bag') || categoryName.includes('backpack')) {
          defaultImg = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600';
        } else if (categoryName.includes('gadget') || categoryName.includes('electronic') || categoryName.includes('phone') || categoryName.includes('headphone')) {
          defaultImg = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600';
        }
        product = { ...product, images: [defaultImg] };
      }
    }
    return { product, quantity: p.quantity, price: p.price };
  });

  return {
    ...orderObj,
    items,
    status: orderObj.orderStatus || 'Pending',
    shippingAddress: {
      ...orderObj.shippingAddress,
      firstName,
      lastName,
      zipCode: orderObj.shippingAddress?.pincode || '',
    },
  };
};

// Create Order
const createOrder = async (req, res) => {
  try {
    const { user, customer, items, products, shippingAddress, totalAmount, paymentMethod, couponCode, discount } = req.body;
    const customerId = customer || user;

    let orderProducts = [];
    if (products && Array.isArray(products)) {
      orderProducts = products;
    } else if (items && Array.isArray(items)) {
      orderProducts = items.map(item => ({
        product: item.product?._id || item.product,
        quantity: item.quantity,
        price: item.price,
      }));
    }

    let normalizedAddress = {};
    if (shippingAddress) {
      normalizedAddress = {
        name: shippingAddress.name || `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim(),
        fullName: shippingAddress.fullName || shippingAddress.name,
        phone: shippingAddress.phone,
        email: shippingAddress.email,
        address: shippingAddress.address,
        addressLine1: shippingAddress.addressLine1 || shippingAddress.address,
        addressLine2: shippingAddress.addressLine2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode || shippingAddress.zipCode,
        country: shippingAddress.country || 'India',
      };
    }

    const order = await Order.create({
      customer: customerId,
      products: orderProducts,
      shippingAddress: normalizedAddress,
      totalAmount,
      paymentMethod: paymentMethod || 'cod',
      couponCode: couponCode || null,
      discount: discount || 0,
      timeline: [{ status: 'Pending', timestamp: new Date(), message: 'Order placed successfully' }],
    });

    const newOrder = await Order.findById(order._id)
      .populate('customer', 'name email')
      .populate('products.product');

    res.status(201).json({ success: true, data: normalizeOrder(newOrder) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Orders By User ID
const getOrdersByUserId = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ customer: req.params.userId })
      .populate('customer', 'name email')
      .populate('products.product')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ customer: req.params.userId });

    res.json({
      success: true,
      data: {
        orders: orders.map(normalizeOrder),
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Orders (Admin with filters)
const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }

    // Search by order ID or customer name
    if (req.query.search) {
      const users = await User.find({
        name: { $regex: req.query.search, $options: 'i' },
      }).select('_id');
      const userIds = users.map(u => u._id);
      filter.$or = [
        { customer: { $in: userIds } },
      ];
    }

    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate('customer', 'name email')
      .populate('products.product')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        orders: orders.map(normalizeOrder),
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Order
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('products.product');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: normalizeOrder(order) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Order (general)
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('customer', 'name email')
      .populate('products.product');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: normalizeOrder(order) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Order
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Order Status (Admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, message } = req.body;
    const order = await Order.findById(req.params.id).populate('customer', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.orderStatus = status;
    order.timeline.push({
      status,
      timestamp: new Date(),
      message: message || `Order status updated to ${status}`,
    });
    await order.save();

    // Send notification email (non-blocking)
    try {
      const { sendOrderStatusEmail } = require('../utils/email');
      if (order.customer?.email) {
        await sendOrderStatusEmail(order.customer, order, message);
      }
    } catch (emailErr) {
      console.error('Email error:', emailErr.message);
    }

    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel Order
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (['Delivered', 'Cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${order.orderStatus} order` });
    }

    order.orderStatus = 'Cancelled';
    order.cancelReason = reason || 'No reason provided';
    order.timeline.push({
      status: 'Cancelled',
      timestamp: new Date(),
      message: reason || 'Order cancelled by customer',
    });
    await order.save();

    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Return Order
const returnOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.orderStatus !== 'Delivered') {
      return res.status(400).json({ success: false, message: 'Can only return delivered orders' });
    }

    order.orderStatus = 'Returned';
    order.returnReason = reason || 'No reason provided';
    order.timeline.push({
      status: 'Returned',
      timestamp: new Date(),
      message: reason || 'Return requested by customer',
    });
    await order.save();

    res.json({ success: true, message: 'Return request submitted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Track Order
const trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).select('orderStatus timeline trackingNumber');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({
      success: true,
      data: {
        status: order.orderStatus,
        trackingNumber: order.trackingNumber,
        timeline: order.timeline,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrdersByUserId,
  updateOrderStatus,
  cancelOrder,
  returnOrder,
  trackOrder,
};