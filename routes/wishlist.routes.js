const express = require('express');
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  removeByProduct,
  clearWishlist,
  checkWishlist,
} = require('../controllers/wishlist.controller');
const protect = require('../middleware/auth.middleware');

// Get user's wishlist
router.get('/user/:userId', protect, getWishlist);

// Check if a product is wishlisted
router.get('/check/:userId/:productId', protect, checkWishlist);

// Add to wishlist
router.post('/', protect, addToWishlist);

// Remove by wishlist item ID
router.delete('/:id', protect, removeFromWishlist);

// Remove by user + product
router.delete('/remove/:userId/:productId', protect, removeByProduct);

// Clear all wishlist items for a user
router.delete('/clear/:userId', protect, clearWishlist);

module.exports = router;
