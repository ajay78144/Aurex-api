const Wishlist = require('../models/Wishlist');

// Get user wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const items = await Wishlist.find({ user: userId })
      .populate('product')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Wishlist.countDocuments({ user: userId });

    res.json({
      success: true,
      data: {
        items,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add product to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { user, product } = req.body;

    // Check if already exists
    const existing = await Wishlist.findOne({ user, product });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }

    const item = await Wishlist.create({ user, product });
    const populated = await Wishlist.findById(item._id).populate('product');

    res.status(201).json({ success: true, message: 'Added to wishlist', data: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove from wishlist (by wishlist item ID)
const removeFromWishlist = async (req, res) => {
  try {
    await Wishlist.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove from wishlist by user + product IDs
const removeByProduct = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    await Wishlist.findOneAndDelete({ user: userId, product: productId });
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear all wishlist items for a user
const clearWishlist = async (req, res) => {
  try {
    await Wishlist.deleteMany({ user: req.params.userId });
    res.json({ success: true, message: 'Wishlist cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check if product is in wishlist
const checkWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const item = await Wishlist.findOne({ user: userId, product: productId });
    res.json({ success: true, data: { isWishlisted: !!item, item: item || null } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  removeByProduct,
  clearWishlist,
  checkWishlist,
};
