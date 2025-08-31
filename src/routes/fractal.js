const express = require('express');
const router = express.Router();
const { generateFractal } = require('../fractalGenerator');
const fs = require('fs');
const path = require('path'); // Add this line
const crypto = require('crypto');
const { verifyToken, isAdmin } = require('./auth.js');
const Fractal = require('../models/fractal.model.js');
const History = require('../models/history.model.js');
const Gallery = require('../models/gallery.model.js');

const fractalsDir = './fractals';

let isGenerating = false;

// POST /generate - Generate a new fractal
router.post('/generate', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin' && !req.user.can_generate_fractals) {
        return res.status(403).json({ message: 'Fractal generation is currently disabled for your account. Please contact an administrator.' });
    }

    if (isGenerating) {
        return res.status(429).send('Another fractal is currently generating. Try again later.');
    }

    const options = {
        width: parseInt(req.body.width) || 1920,
        height: parseInt(req.body.height) || 1080,
        maxIterations: parseInt(req.body.maxIterations) || 500,
        power: parseFloat(req.body.power) || 2,
        c: {
            real: parseFloat(req.body.c.real) || 0.285,
            imag: parseFloat(req.body.c.imag) || 0.01
        },
        scale: parseFloat(req.body.scale) || 1,
        offsetX: parseFloat(req.body.offsetX) || 0,
        offsetY: parseFloat(req.body.offsetY) || 0,
        colorScheme: req.body.colorScheme || 'rainbow',
    };

    const optionsString = JSON.stringify(options);

    const hash = crypto.createHash('sha256').update(optionsString).digest('hex');

    Fractal.findFractalByHash(hash, async (err, row) => {
        if (err) {
            return res.status(500).send("Database error");
        }

        if (row) {
            // Fractal exists, log to history and add to gallery (if not already there)
            History.createHistoryEntry(req.user.id, row.id, (err) => {
                if (err) {
                    console.error("Failed to log history", err);
                }
            });
            Gallery.addToGallery(req.user.id, row.id, row.hash, (err) => {
                if (err) {
                    console.error("Failed to add to gallery", err);
                }
            });
            const fractalUrl = fractal.hash ? `${req.protocol}://${req.get('host')}/fractals/${fractal.hash}.png` : null;
            res.json({ ...fractal, url: fractalUrl, generated_at_user: generatedAt });
        } else {
            // Fractal does not exist, generate it
            isGenerating = true;
            let buffer;
            try {
                buffer = await generateFractal(options);
            } catch (err) {
                isGenerating = false;
                console.error(err);
                return res.status(500).send('Fractal generation failed');
            }
            isGenerating = false;

            if (!buffer) {
                return res.status(499).send('Fractal generation aborted due to time limit.');
            }

            const imagePath = `${fractalsDir}/${hash}.png`;
            fs.writeFileSync(imagePath, buffer);

            const fractalData = { ...options, hash, imagePath };

            Fractal.createFractal(fractalData, (err, result) => {
                if (err) {
                    console.error("Failed to save fractal to DB", err);
                    return res.status(500).send("Failed to save fractal.");
                }

                History.createHistoryEntry(req.user.id, result.id, (err) => {
                    if (err) {
                        console.error("Failed to log history", err);
                    }
                });
                Gallery.addToGallery(req.user.id, result.id, hash, (err) => {
                    if (err) {
                        console.error("Failed to add to gallery", err);
                    }
                });

                const fractalUrl = hash ? `${req.protocol}://${req.get('host')}/fractals/${hash}.png` : null;
                res.json({ ...options, hash, url: fractalUrl });
            });
        }
    });
});

// GET /fractals - List all fractals (with pagination, filtering, sorting)
router.get('/fractals', verifyToken, async (req, res) => {
    const { page = 1, limit = 10, colorScheme, power, iterations, width, height, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    const filters = {};
    if (colorScheme) filters.colorScheme = colorScheme;
    if (power) filters.power = parseFloat(power);
    if (iterations) filters.iterations = parseInt(iterations);
    if (width) filters.width = parseInt(width);
    if (height) filters.height = parseInt(height);

    Fractal.getAllFractals({ limit: parseInt(limit), offset, filters, sortBy, sortOrder }, (err, data, totalCount) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to fetch fractals.' });
        }

        const fractalsWithUrls = data.map(fractal => ({
            ...fractal,
            url: `${req.protocol}://${req.get('host')}/fractals/${fractal.hash}.png`
        }));

        res.json({ data: fractalsWithUrls, totalCount });
    });
});

// GET /fractals/:fractal_id - Get a single fractal by ID
router.get('/fractals/:fractal_id', verifyToken, (req, res) => {
    const fractalId = parseInt(req.params.fractal_id); // Convert to integer

    if (isNaN(fractalId)) {
        return res.status(400).json({ message: 'Invalid fractal ID.' });
    }

    Fractal.getFractalById(fractalId, (err, fractal) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to fetch fractal.' });
        }
        if (!fractal) {
            return res.status(404).json({ message: 'Fractal not found.' });
        }

        // Fetch user-specific generated_at from history
        // Ensure req.user.id and fractal.id are valid before querying history
        if (!req.user || !req.user.id || !fractal || !fractal.id) {
            console.error("Missing user ID or fractal ID for history entry query. req.user:", req.user, "fractal:", fractal);
            const imagePath = path.join(fractalsDir, `${fractal.hash}.png`);
            const fractalUrl = fs.existsSync(imagePath) ? `${req.protocol}://${req.get('host')}/fractals/${fractal.hash}.png` : null;
            return res.json({ ...fractal, url: fractalUrl, generated_at_user: null }); // Return without history data
        }

        History.getHistoryEntryByUserAndFractal(req.user.id, fractal.id, (err, historyEntry) => {
            if (err) {
                console.error("Error fetching history entry:", err);
                // Continue without generated_at if there's an error
                const imagePath = path.join(fractalsDir, `${fractal.hash}.png`);
                const fractalUrl = fs.existsSync(imagePath) ? `${req.protocol}://${req.get('host')}/fractals/${fractal.hash}.png` : null;
                return res.json({ ...fractal, url: fractalUrl, generated_at_user: null }); // Ensure generated_at_user is null on error
            }

            const generatedAt = historyEntry ? `${historyEntry.generated_at}Z` : null;
            const imagePath = path.join(fractalsDir, `${fractal.hash}.png`);
            const fractalUrl = fs.existsSync(imagePath) ? `${req.protocol}://${req.get('host')}/fractals/${fractal.hash}.png` : null;
            res.json({ ...fractal, url: fractalUrl, generated_at_user: generatedAt });
        });
    });
});

// DELETE /fractals/:fractal_id - Delete a fractal by ID
router.delete('/fractals/:fractal_id', verifyToken, isAdmin, (req, res) => {
    const { fractal_id } = req.params;
    Fractal.deleteFractal(fractal_id, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to delete fractal.' });
        }
        res.json({ message: 'Fractal deleted successfully.' });
    });
});

// PUT /fractals/:fractal_id - Update a fractal by ID
router.put('/fractals/:fractal_id', verifyToken, isAdmin, (req, res) => {
    const { fractal_id } = req.params;
    const updates = req.body;
    Fractal.updateFractal(fractal_id, updates, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to update fractal.' });
        }
        res.json({ message: 'Fractal updated successfully.' });
    });
});

// DELETE /gallery/:id - Delete a gallery entry by ID
router.delete('/gallery/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const isAdmin = req.user.role === 'admin';

    Gallery.deleteGalleryEntry(id, req.user.id, isAdmin, (err) => {
        if (err) {
            console.error("Failed to delete gallery entry:", err);
            return res.status(500).json({ success: false, message: 'Failed to delete gallery entry.' });
        }
        res.json({ success: true, message: 'Gallery entry deleted successfully.' });
    });
});

// GET /fractals/search - Search fractals
router.get('/fractals/search', verifyToken, (req, res) => {
    const { query } = req.query;
    Fractal.searchFractals(query, (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to search fractals.' });
        }
        res.json({ data });
    });
});

module.exports = router;
