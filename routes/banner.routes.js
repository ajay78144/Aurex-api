const express = require('express');
const router = express.Router();
const {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
  toggleBanner,
} = require('../controllers/banner.controller');
const protect = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/admin.js');
const upload = require('../middleware/upload.js');

// Public
router.get('/', getBanners);
router.get('/:id', getBannerById);

// Admin only
router.post('/', protect, isAdmin, upload.single('image'), createBanner);
router.put('/:id/toggle', protect, isAdmin, toggleBanner);
router.put('/:id', protect, isAdmin, upload.single('image'), updateBanner);
router.delete('/:id', protect, isAdmin, deleteBanner);

module.exports = router;