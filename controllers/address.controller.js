const Address = require('../models/Address');

// Get all addresses of a user
const getUserAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.params.userId }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ success: true, data: addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single address
const getAddressById = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
    res.json({ success: true, data: address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add new address
const addAddress = async (req, res) => {
  try {
    const { user, isDefault } = req.body;

    // If this address is set as default, unset all others
    if (isDefault) {
      await Address.updateMany({ user }, { isDefault: false });
    }

    const address = await Address.create(req.body);
    res.status(201).json({ success: true, message: 'Address added', data: address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

    if (req.body.isDefault) {
      await Address.updateMany({ user: address.user }, { isDefault: false });
    }

    const updated = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, message: 'Address updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    await Address.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Set as default address
const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

    await Address.updateMany({ user: address.user }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    res.json({ success: true, message: 'Default address set', data: address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUserAddresses,
  getAddressById,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
