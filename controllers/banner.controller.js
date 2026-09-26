const Banner = require('../models/Banner');
const cloudinary = require('../config/cloudinary');

// Create Banner
const createBanner = async (req, res) => {
  try {
    const bannerData = { ...req.body };
    if (req.file) {
      bannerData.image = req.file.path;
      bannerData.imagePublicId = req.file.filename;
    }
    bannerData.isActive = bannerData.isActive !== undefined ? bannerData.isActive : true;
    bannerData.active = bannerData.isActive;

    const banner = await Banner.create(bannerData);
    res.status(201).json({ success: true, message: 'Banner created', data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Banners
const getBanners = async (req, res) => {
  try {
    const filter = {};
    if (req.query.active !== undefined) {
      filter.isActive = req.query.active === 'true';
    }
    const banners = await Banner.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Banner By ID
const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    res.json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Banner
const updateBanner = async (req, res) => {
  try {
    const bannerData = { ...req.body };
    if (req.file) {
      // Delete old image if exists
      const existing = await Banner.findById(req.params.id);
      if (existing?.imagePublicId) {
        try { await cloudinary.uploader.destroy(existing.imagePublicId); } catch (e) {}
      }
      bannerData.image = req.file.path;
      bannerData.imagePublicId = req.file.filename;
    }
    if (bannerData.isActive !== undefined) {
      bannerData.active = bannerData.isActive;
    }

    const banner = await Banner.findByIdAndUpdate(req.params.id, bannerData, { new: true });
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    res.json({ success: true, message: 'Banner updated', data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Banner
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

    if (banner.imagePublicId) {
      try { await cloudinary.uploader.destroy(banner.imagePublicId); } catch (e) {}
    }
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle Banner Active/Inactive
const toggleBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

    banner.isActive = !banner.isActive;
    banner.active = banner.isActive;
    await banner.save();

    res.json({
      success: true,
      message: `Banner ${banner.isActive ? 'activated' : 'deactivated'}`,
      data: banner,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createBanner, getBanners, getBannerById, updateBanner, deleteBanner, toggleBanner };