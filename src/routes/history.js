const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth.js');
const fs = require('fs');
const History = require('../models/history.model.js');
const Fractal = require('../models/fractal.model.js');
const Gallery = require('../models/gallery.model.js');

// GET user gallery
router.get('/gallery', verifyToken, (req, res) => {
    Gallery.getGalleryForUser(req.user.id, (err, rows) => {
        if (err) {
            return res.status(500).send("Database error");
        }
        res.json(rows);
    });
});

// DELETE gallery entry
router.delete('/gallery/:id', verifyToken, (req, res) => {
    const galleryId = req.params.id;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // First, get the fractal_id from the gallery entry to be deleted
    Gallery.getGalleryEntry(galleryId, userId, isAdmin, (err, row) => {
        if (err) {
            return res.status(500).send("Database error");
        }
        if (!row) {
            // If not found and not admin, or if found but not owned by user and not admin
            if (!isAdmin) {
                return res.status(404).send("Gallery entry not found or you don't have permission to delete it.");
            } else {
                return res.status(404).send("Gallery entry not found.");
            }
        }

        const fractalId = row.fractal_id;
        const fractalHash = row.fractal_hash; // Get the hash from the gallery entry

        Gallery.deleteGalleryEntry(galleryId, userId, isAdmin, function(err) {
            if (err) {
                return res.status(500).send("Database error");
            }

            // Check if any other user has this fractal in their gallery
            Gallery.countGalleryByFractalHash(fractalHash, (err, row) => {
                if (err) {
                    return console.error("Error checking for other fractal galleries", err);
                }

                if (row.count === 0) {
                    // No other user has this fractal in their gallery, so delete it from fractals table and filesystem
                    Fractal.getFractalImagePath(fractalId, (err, row) => {
                        if (err) {
                            return console.error("Error getting image path", err);
                        }
                        if (row) {
                            fs.unlink(row.image_path, (err) => {
                                if (err) console.error("Error deleting image file", err);
                            });
                            Fractal.deleteFractal(fractalId, (err) => {
                                if (err) console.error("Error deleting fractal", err);
                            });
                        }
                    });
                }
            });

            res.send({ message: "Gallery entry deleted successfully" });
        });
    });
});

// GET all history (Admin only)
router.get('/admin/history', verifyToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send('Access denied. Admin privileges required.');
    }

    History.getAllHistory((err, rows) => {
        if (err) {
            return res.status(500).send("Database error");
        }
        res.json(rows);
    });
});

// GET all gallery items (Admin only)
router.get('/admin/gallery', verifyToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send('Access denied. Admin privileges required.');
    }

    Gallery.getAllGallery((err, rows) => {
        if (err) {
            return res.status(500).send("Database error");
        }
        res.json(rows);
    });
});

module.exports = router;
