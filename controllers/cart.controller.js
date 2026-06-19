const Cart = require("../models/Cart");

// ===============================
// Add To Cart
// ===============================
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

// ===============================
// Get All Cart Items
// ===============================
const getCart = async (req, res) => {
  try {

    const cartItems = await Cart.find()
      .populate("user", "name email")
      .populate("product");

    res.status(200).json(cartItems);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

// ===============================
// Get Single Cart Item
// ===============================
const getCartById = async (req, res) => {
  try {

    const cart = await Cart.findById(req.params.id)
      .populate("user", "name email")
      .populate("product");

    if (!cart) {
      return res.status(404).json({
        message: "Cart item not found"
      });
    }

    res.status(200).json(cart);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

// ===============================
// Update Cart Quantity
// ===============================
const updateCart = async (req, res) => {
  try {

    const cart = await Cart.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true
      }
    );

    if (!cart) {
      return res.status(404).json({
        message: "Cart item not found"
      });
    }

    res.status(200).json(cart);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

// ===============================
// Delete Single Cart Item
// ===============================
const removeCartItem = async (req, res) => {
  try {

    const cart = await Cart.findByIdAndDelete(req.params.id);

    if (!cart) {
      return res.status(404).json({
        message: "Cart item not found"
      });
    }

    res.status(200).json({
      message: "Item removed from cart successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

// ===============================
// Clear Complete Cart
// ===============================
const clearCart = async (req, res) => {
  try {

    await Cart.deleteMany({});

    res.status(200).json({
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
  getCartById,
  updateCart,
  removeCartItem,
  clearCart
};