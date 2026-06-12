const Banner = require("../models/Banner");

// Create Banner
const createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);

    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Banners
const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find();

    res.json(banners);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Banner By ID
const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        message: "Banner not found",
      });
    }

    res.json(banner);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Banner
const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(banner);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Banner
const deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);

    res.json({
      message: "Banner deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
};