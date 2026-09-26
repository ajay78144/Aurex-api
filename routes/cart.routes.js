const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCart,
  getAllCarts,
  updateQuantity,
  increaseQuantity,
  decreaseQuantity,
  deleteCartItem,
  clearCart,
} = require('../controllers/cart.controller');

// ==============================
// Get All Carts (Admin)
// GET /api/cart
// ==============================
router.get('/', getAllCarts);

// ==============================
// Get User Cart
// GET /api/cart/user/:userId
// ==============================
router.get('/user/:userId', getCart);

// ==============================
// Add Product To Cart
// POST /api/cart
// ==============================
router.post('/', addToCart);

// ==============================
// Increase Quantity  (named routes before /:id)
// PUT/PATCH /api/cart/increase/:id
// ==============================
router.put('/increase/:id', increaseQuantity);
router.patch('/increase/:id', increaseQuantity);

// ==============================
// Decrease Quantity
// PUT/PATCH /api/cart/decrease/:id
// ==============================
router.put('/decrease/:id', decreaseQuantity);
router.patch('/decrease/:id', decreaseQuantity);

// ==============================
// Clear User Cart  (before DELETE /:id)
// DELETE /api/cart/clear/:userId
// ==============================
router.delete('/clear/:userId', clearCart);

// ==============================
// Update Quantity
// PUT /api/cart/update/:id and PUT /api/cart/:id
// ==============================
router.put('/update/:id', updateQuantity);
router.put('/:id', updateQuantity);

// ==============================
// Delete Cart Item
// DELETE /api/cart/:id
// ==============================
router.delete('/:id', deleteCartItem);

module.exports = router;