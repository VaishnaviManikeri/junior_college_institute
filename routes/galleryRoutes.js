const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/page/:page', galleryController.getGalleryItems);

// Protected routes (require authentication)
router.post('/', auth, upload.single('file'), galleryController.createGalleryItem);
router.get('/all', auth, galleryController.getAllGalleryItems);
router.put('/:id', auth, galleryController.updateGalleryItem);
router.delete('/:id', auth, galleryController.deleteGalleryItem);

module.exports = router;