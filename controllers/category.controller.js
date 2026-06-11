const Category = require("../models/Category");

// Create Category
const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const category = await Category.create({
      name,
      description,
      image
    });

    res.status(201).json(category);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get All Categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    res.status(200).json(categories);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get Single Category
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    res.status(200).json(category);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Update Category
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    res.status(200).json(category);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Delete Category
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    res.json({
      message: "Category deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Export Functions
module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};