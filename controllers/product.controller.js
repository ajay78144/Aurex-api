const Product = require('../models/Product');

// Helper to normalize product data
const normalizeProduct = (product) => {
  if (!product) return null;
  const p = product.toObject ? product.toObject() : product;
  if (!p.images) {
    p.images = [];
  }
  return p;
};

// Helper: standard success response
const ok = (res, data) => res.json({ success: true, data });
const created = (res, data) => res.status(201).json({ success: true, data });

// ────────────────────────────────────────────────────────────────────────────
// CREATE PRODUCT
// ────────────────────────────────────────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const baseName = req.body.name || '';
    const baseSlug = baseName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    // Ensure unique slug
    let slug = baseSlug;
    let count = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    const product = await Product.create({ ...req.body, slug });
    return created(res, normalizeProduct(product));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// GET ALL PRODUCTS  (with optional pagination)
// ────────────────────────────────────────────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 0; // 0 = no limit
    const skip = (page - 1) * (limit || 0);

    let query = Product.find().populate('category');
    if (limit) query = query.skip(skip).limit(limit);

    const products = await query.sort({ createdAt: -1 });
    const total = await Product.countDocuments();

    return ok(res, { products: products.map(normalizeProduct), total, page, pages: limit ? Math.ceil(total / limit) : 1 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// GET PRODUCT BY ID
// ────────────────────────────────────────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    return ok(res, normalizeProduct(product));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// UPDATE PRODUCT
// ────────────────────────────────────────────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.body.name) {
      updateData.slug = req.body.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('category');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    return ok(res, normalizeProduct(product));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// DELETE PRODUCT
// ────────────────────────────────────────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// SEARCH PRODUCTS  — supports both /search/:keyword (path) and /search?keyword= (query)
// ────────────────────────────────────────────────────────────────────────────
const searchProducts = async (req, res) => {
  try {
    const keyword = req.params.keyword || req.query.keyword || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = keyword
      ? {
          $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } },
            { brand: { $regex: keyword, $options: 'i' } },
            { tags: { $in: [new RegExp(keyword, 'i')] } },
          ],
        }
      : {};

    const products = await Product.find(filter).populate('category').sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Product.countDocuments(filter);

    return ok(res, { products: products.map(normalizeProduct), total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// GET PRODUCTS BY CATEGORY
// ────────────────────────────────────────────────────────────────────────────
const getProductsByCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const products = await Product.find({ category: req.params.categoryId })
      .populate('category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments({ category: req.params.categoryId });
    return ok(res, { products: products.map(normalizeProduct), total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// FILTER PRODUCTS  — GET /api/products/filter
// Query: keyword, category, minPrice, maxPrice, sort, page, limit
// ────────────────────────────────────────────────────────────────────────────
const filterProducts = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, sort, gender, brand } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { brand: { $regex: keyword, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;
    if (gender) filter.gender = gender;
    if (brand) filter.brand = { $regex: brand, $options: 'i' };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'name_asc') sortOption = { name: 1 };
    else if (sort === 'name_desc') sortOption = { name: -1 };

    const products = await Product.find(filter)
      .populate('category')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    return ok(res, { products: products.map(normalizeProduct), total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// LATEST PRODUCTS — GET /api/products/latest
// ────────────────────────────────────────────────────────────────────────────
const getLatestProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await Product.find()
      .populate('category')
      .sort({ createdAt: -1 })
      .limit(limit);
    return ok(res, products.map(normalizeProduct));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// FEATURED PRODUCTS — GET /api/products/featured
// ────────────────────────────────────────────────────────────────────────────
const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await Product.find({ $or: [{ isFeatured: true }, { featured: true }] })
      .populate('category')
      .sort({ createdAt: -1 })
      .limit(limit);
    return ok(res, products.map(normalizeProduct));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// TRENDING PRODUCTS — GET /api/products/trending
// ────────────────────────────────────────────────────────────────────────────
const getTrendingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await Product.find({ $or: [{ isTrending: true }, { trending: true }] })
      .populate('category')
      .sort({ createdAt: -1 })
      .limit(limit);
    return ok(res, products.map(normalizeProduct));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// FLASH SALE PRODUCTS — GET /api/products/flash-sale
// ────────────────────────────────────────────────────────────────────────────
const getFlashSaleProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const now = new Date();

    const products = await Product.find({
      isFlashSale: true,
      $or: [
        { flashSaleEndsAt: null },
        { flashSaleEndsAt: { $gt: now } },
      ],
    })
      .populate('category')
      .sort({ createdAt: -1 })
      .limit(limit);

    return ok(res, products.map(normalizeProduct));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// BEST SELLER PRODUCTS — GET /api/products/best-sellers
// ────────────────────────────────────────────────────────────────────────────
const getBestSellerProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await Product.find({ isBestSeller: true })
      .populate('category')
      .sort({ createdAt: -1 })
      .limit(limit);
    return ok(res, products.map(normalizeProduct));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};