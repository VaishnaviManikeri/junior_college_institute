const Gallery = require('../models/Gallery');
const { cloudinary } = require('../config/cloudinary');

exports.createGalleryItem = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a file' });
        }

        const { title, description, galleryPage } = req.body;
        const type = req.file.mimetype.startsWith('video') ? 'video' : 'image';

        const galleryItem = new Gallery({
            type,
            title,
            description,
            url: req.file.path,
            publicId: req.file.filename,
            galleryPage: parseInt(galleryPage),
            uploadedBy: req.admin._id
        });

        await galleryItem.save();
        res.status(201).json(galleryItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getGalleryItems = async (req, res) => {
    try {
        const { page } = req.params;
        const galleryItems = await Gallery.find({ galleryPage: parseInt(page) })
            .sort({ createdAt: -1 })
            .populate('uploadedBy', 'username');
        
        res.json(galleryItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateGalleryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const galleryItem = await Gallery.findByIdAndUpdate(
            id, 
            updates, 
            { new: true, runValidators: true }
        );
        
        if (!galleryItem) {
            return res.status(404).json({ error: 'Gallery item not found' });
        }
        
        res.json(galleryItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteGalleryItem = async (req, res) => {
    try {
        const { id } = req.params;
        
        const galleryItem = await Gallery.findById(id);
        
        if (!galleryItem) {
            return res.status(404).json({ error: 'Gallery item not found' });
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(galleryItem.publicId, {
            resource_type: galleryItem.type === 'video' ? 'video' : 'image'
        });

        // Delete from database
        await Gallery.findByIdAndDelete(id);
        
        res.json({ message: 'Gallery item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllGalleryItems = async (req, res) => {
    try {
        const galleryItems = await Gallery.find()
            .sort({ galleryPage: 1, createdAt: -1 })
            .populate('uploadedBy', 'username');
        
        res.json(galleryItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};