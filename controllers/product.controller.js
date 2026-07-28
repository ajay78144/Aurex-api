const Product = require("../models/Product");

// Helper to normalize product data and insert category-related default images
const normalizeProduct = (product) => {
  if (!product) return null;
  const p = product.toObject ? product.toObject() : product;
  if (!p.images || p.images.length === 0 || !p.images[0]) {
    const categoryName = (p.category?.name || '').toLowerCase();
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
    p.images = [defaultImg];
  }
  return p;
};

// Create Product
const createProduct = async (req, res) => {
  try {
    const slug = req.body.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");
    const product = await Product.create({
      ...req.body,
      slug
    });
    res.status(201).json(normalizeProduct(product));
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get All Products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    res.status(200).json(products.map(normalizeProduct));
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get Product By ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }
    res.status(200).json(normalizeProduct(product));
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.body.name) {
      updateData.slug = req.body.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate("category");
    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }
    res.status(200).json(normalizeProduct(product));
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }
    res.status(200).json({
      message: "Product deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Search Product
const searchProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const products = await Product.find({
      name: {
        $regex: keyword,
        $options: "i"
      }
    }).populate("category");
    res.status(200).json(products.map(normalizeProduct));
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get Products By Category
const getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const products = await Product.find({
      category: categoryId
    }).populate("category");
    res.status(200).json(products.map(normalizeProduct));
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory
};