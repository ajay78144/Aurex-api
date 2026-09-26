const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  filterProducts,
  getLatestProducts,
  getFeaturedProducts,
  getTrendingProducts,
  getFlashSaleProducts,
  getBestSellerProducts,
} = require('../controllers/product.controller');
const protect = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/admin.js');

// ─── Special / named routes (must come BEFORE /:id) ──────────────────────────

// GET /api/products/filter?keyword=&category=&minPrice=&maxPrice=&sort=
router.get('/filter', filterProducts);

// GET /api/products/latest
router.get('/latest', getLatestProducts);

// GET /api/products/featured
router.get('/featured', getFeaturedProducts);

// GET /api/products/trending
router.get('/trending', getTrendingProducts);

// GET /api/products/flash-sale
router.get('/flash-sale', getFlashSaleProducts);

// GET /api/products/best-sellers
router.get('/best-sellers', getBestSellerProducts);

// GET /api/products/search/:keyword  (path param style)
router.get('/search/:keyword', searchProducts);

// GET /api/products/search?keyword=  (query param style)
router.get('/search', searchProducts);

// GET /api/products/category/:categoryId
router.get('/category/:categoryId', getProductsByCategory);

// ─── CRUD routes ─────────────────────────────────────────────────────────────

// GET  /api/products
router.get('/', getProducts);

// POST /api/products  (admin)
router.post('/', protect, isAdmin, createProduct);

// GET  /api/products/:id
router.get('/:id', getProductById);

// PUT  /api/products/:id  (admin)
router.put('/:id', protect, isAdmin, updateProduct);

// DELETE /api/products/:id  (admin)
router.delete('/:id', protect, isAdmin, deleteProduct);

module.exports = router;