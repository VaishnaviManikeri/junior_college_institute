const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const auth = require('../middleware/auth');

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin._id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ 
            token, 
            admin: { 
                id: admin._id, 
                username: admin.username 
            } 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get admin profile
router.get('/profile', auth, async (req, res) => {
    res.json(req.admin);
});

// Create admin (protected)
router.post('/create', auth, async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const admin = new Admin({ username, password });
        await admin.save();
        
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;