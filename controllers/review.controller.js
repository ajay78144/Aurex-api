const Review = require("../models/Review");
const Product = require("../models/Product");

// Helper to update overall product rating
const updateProductRating = async (productId) => {
  if (!productId) return;
  try {
    const reviews = await Review.find({ product: productId });
    if (reviews.length > 0) {
      const avg = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
      await Product.findByIdAndUpdate(productId, { rating: parseFloat(avg.toFixed(1)) });
    } else {
      await Product.findByIdAndUpdate(productId, { rating: 0 });
    }
  } catch (error) {
    console.error("Error updating product rating:", error);
  }
};

// Create Review
const createReview = async (req, res) => {
  try {
    const review = await Review.create(req.body);
    await updateProductRating(req.body.product);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Reviews (supporting filter by product query param)
const getReviews = async (req, res) => {
  try {
    const filter = {};
    if (req.query.product) {
      filter.product = req.query.product;
    }
    const reviews = await Review.find(filter)
      .populate("user")
      .populate("product");

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Review
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Review
const updateReview = async (req, res) => {
  try {
    const reviewBefore = await Review.findById(req.params.id);
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (review) {
      await updateProductRating(review.product);
      if (reviewBefore && reviewBefore.product.toString() !== review.product.toString()) {
        await updateProductRating(reviewBefore.product);
      }
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (review) {
      await Review.findByIdAndDelete(req.params.id);
      await updateProductRating(review.product);
    } else {
      await Review.findByIdAndDelete(req.params.id);
    }

    res.json({
      message: "Review deleted",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
};