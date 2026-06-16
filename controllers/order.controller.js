const Order = require("../models/Order");

// Create Order
const createOrder = async (req, res) => {
  try {

    const order = await Order.create(req.body);

    const newOrder = await Order.findById(order._id)
      .populate("customer", "name email")
      .populate("products.product");

    res.status(201).json(newOrder);

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

    res.json(orders);

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

    res.json(order);

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

    res.json(order);

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
  deleteOrder
};