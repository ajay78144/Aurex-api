const Order = require("../models/Order");

// Helper to normalize order data for frontend consumption
const normalizeOrder = (order) => {
  if (!order) return null;
  const orderObj = order.toObject ? order.toObject() : order;
  const name = orderObj.shippingAddress?.name || '';
  const nameParts = name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const items = (orderObj.products || []).map(p => {
    let product = p.product;
    if (product && typeof product === 'object') {
      if (!product.images || product.images.length === 0 || !product.images[0]) {
        // Fallback image mapping by category name
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
        product = {
          ...product,
          images: [defaultImg]
        };
      }
    }
    return {
      product,
      quantity: p.quantity,
      price: p.price
    };
  });

  return {
    ...orderObj,
    items,
    status: orderObj.orderStatus || 'Pending',
    shippingAddress: {
      ...orderObj.shippingAddress,
      firstName,
      lastName,
      zipCode: orderObj.shippingAddress?.pincode || ''
    }
  };
};

// Create Order
const createOrder = async (req, res) => {
  try {
    const { user, customer, items, products, shippingAddress, totalAmount, paymentMethod } = req.body;

    // Normalize customer ID
    const customerId = customer || user;

    // Normalize products/items
    let orderProducts = [];
    if (products && Array.isArray(products)) {
      orderProducts = products;
    } else if (items && Array.isArray(items)) {
      orderProducts = items.map(item => ({
        product: item.product?._id || item.product,
        quantity: item.quantity,
        price: item.price
      }));
    }

    // Normalize shippingAddress
    let normalizedAddress = {};
    if (shippingAddress) {
      normalizedAddress = {
        name: shippingAddress.name || `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim(),
        phone: shippingAddress.phone,
        email: shippingAddress.email,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode || shippingAddress.zipCode
      };
    }

    const orderData = {
      customer: customerId,
      products: orderProducts,
      shippingAddress: normalizedAddress,
      totalAmount: totalAmount,
      paymentMethod: paymentMethod || "COD"
    };

    const order = await Order.create(orderData);

    const newOrder = await Order.findById(order._id)
      .populate("customer", "name email")
      .populate("products.product");

    res.status(201).json(normalizeOrder(newOrder));

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get Orders By User ID
const getOrdersByUserId = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.params.userId })
      .populate("customer", "name email")
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.json(orders.map(normalizeOrder));
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get All Orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email")
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.json(orders.map(normalizeOrder));

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get Single Order
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email")
      .populate("products.product");

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json(normalizeOrder(order));

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Update Order
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true
      }
    )
    .populate("customer", "name email")
    .populate("products.product");

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json(normalizeOrder(order));

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Delete Order
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json({
      message: "Order deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrdersByUserId
};