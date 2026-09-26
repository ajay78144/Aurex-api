const express = require('express');
const router = express.Router();
const {
  getUserAddresses,
  getAddressById,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require('../controllers/address.controller');
const protect = require('../middleware/auth.middleware');

router.get('/user/:userId', protect, getUserAddresses);
router.get('/:id', protect, getAddressById);
router.post('/', protect, addAddress);
router.put('/:id', protect, updateAddress);
router.put('/:id/default', protect, setDefaultAddress);
router.delete('/:id', protect, deleteAddress);

module.exports = router;
