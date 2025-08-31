const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('./auth');
const User = require('../users');
const Gallery = require('../models/gallery.model');
const History = require('../models/history.model');
const fs = require('fs');
const path = require('path');

const fractalsDir = './fractals';

router.use(verifyToken);
router.use(isAdmin);

router.get('/users', (req, res) => {
    let limit = parseInt(req.query.limit);
    if (req.user.role === 'admin' && limit === 0) {
        limit = null; // No limit for admins when 0 is provided
    } else if (isNaN(limit)) {
        limit = 5; // Default limit
    }
    const offset = parseInt(req.query.offset) || 0;

    User.getAll(limit, offset, (err, usersData, totalCount) => {
        if (err) {
            console.error("Database error retrieving users:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
        const usersWithoutPasswords = usersData.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        res.json({ data: usersWithoutPasswords, totalCount, limit, offset });
    });
});

router.put('/users/:id/toggle-generation', (req, res) => {
    const userId = parseInt(req.params.id);

    User.findById(userId, (err, user) => {
        if (err) {
            console.error("Database error finding user:", err);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (!user) {
            return res.status(404).send('User not found');
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot modify admin generation status via this endpoint.' });
        }

        const newStatus = user.can_generate_fractals === 1 ? 0 : 1;

        User.update(userId, { can_generate_fractals: newStatus }, (err, changes) => {
            if (err) {
                console.error("Database error updating user:", err);
                return res.status(500).json({ message: "Internal server error" });
            }
            if (changes === 0) {
                return res.status(404).send('User not found or no changes made.');
            }
            res.json({ message: `User ${user.username} fractal generation toggled to ${newStatus === 1 ? true : false}`, can_generate_fractals: newStatus === 1 ? true : false });
        });
    });
});

router.get('/history', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const filters = {}; // Empty object
    const sortBy = req.query.sortBy || 'generated_at';
    const sortOrder = req.query.sortOrder || 'DESC';

    History.getAllHistory(filters, sortBy, sortOrder, limit, offset, (err, historyData, totalCount) => {
        if (err) {
            console.error("Database error retrieving history:", err);
            return res.status(500).json({ message: "Internal server error" });
        }

        User.getAll(null, null, (err, usersData) => {
            if (err) {
                console.error("Database error retrieving users for history mapping:", err);
                return res.status(500).json({ message: "Internal server error" });
            }

            const userMap = {};
            usersData.forEach(user => {
                userMap[user.id] = user.username;
            });

            const historyWithUrlsAndUsernames = historyData.map(item => {
                const imagePath = path.join(fractalsDir, `${item.hash}.png`);
                const imageUrl = fs.existsSync(imagePath) ? `${req.protocol}://${req.get('host')}/fractals/${item.hash}.png` : null;
                return {
                    ...item,
                    username: userMap[item.user_id] || 'Unknown',
                    url: imageUrl // Add the URL based on file existence
                };
            });

            res.json({ data: historyWithUrlsAndUsernames, totalCount, limit, offset });
        });
    });
});

router.delete('/users/:id/gallery', (req, res) => {
    const userId = parseInt(req.params.id);

    Gallery.deleteGalleryForUser(userId, (err) => {
        if (err) {
            console.error("Failed to delete user gallery:", err);
            return res.status(500).json({ message: 'Failed to delete user gallery.' });
        }
        res.json({ message: 'User gallery deleted successfully.' });
    });
});

module.exports = router;