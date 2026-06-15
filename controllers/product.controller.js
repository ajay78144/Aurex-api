const Product = require("../models/Product");

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

    res.status(201).json(product);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

// Get All Products
const getProducts = async (req, res) => {
  try {

    const products = await Product.find()
      .populate("category");

    res.status(200).json(products);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

// Get Product By ID
const getProductById = async (req, res) => {
  try {

    const product = await Product.findById(req.params.id)
      .populate("category");

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.status(200).json(product);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {

    const updateData = {
      ...req.body
    };

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
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.status(200).json(product);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  try {

    const product = await Product.findByIdAndDelete(
      req.params.id
    );

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

// Search Products
const searchProducts = async (req, res) => {
  try {

    const keyword = req.query.keyword || "";

    const products = await Product.find({
      name: {
        $regex: keyword,
        $options: "i"
      }
    }).populate("category");

    res.status(200).json(products);

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
  searchProducts
};