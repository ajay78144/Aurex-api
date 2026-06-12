const Cart = require("../models/Cart");

// Add To Cart
const addToCart = async (req, res) => {
  try {

    const cart = await Cart.create(req.body);

    res.status(201).json(cart);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

// Get Cart Items
const getCart = async (req, res) => {
  try {

    const cartItems = await Cart.find()
      .populate("user")
      .populate("product");

    res.json(cartItems);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

// Update Cart Quantity
const updateCart = async (req, res) => {
  try {

    const cart = await Cart.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(cart);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

// Remove Single Item
const removeCartItem = async (req, res) => {
  try {

    await Cart.findByIdAndDelete(req.params.id);

    res.json({
      message: "Item removed from cart"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

// Clear Complete Cart
const clearCart = async (req, res) => {
  try {

    await Cart.deleteMany();

    res.json({
      message: "Cart cleared successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

module.exports = {
  addToCart,
  getCart,
  updateCart,
  removeCartItem,
  clearCart
};