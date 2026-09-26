const express = require('express');
const router = express.Router();
const { uploadImage, deleteImage } = require('../controllers/upload.controller');
const protect = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.js');

router.post('/image', protect, upload.single('file'), uploadImage);
router.delete('/image/:publicId', protect, deleteImage);

module.exports = router;
