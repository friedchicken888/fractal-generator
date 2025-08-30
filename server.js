const express = require('express');
const { generateFractal } = require('./fractal');
const fs = require('fs');
const { router: authRouter, verifyToken } = require('./auth');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// Debug flag
const DEBUG = false; // Set to true to see console logs

// Track if a fractal is currently being generated
let isGenerating = false;

// Debug logging function
function debugLog(...args) {
    if (DEBUG) console.log(...args);
}

// Routes
app.use('/api/auth', authRouter);

app.get('/fractal', verifyToken, async (req, res) => {
    if (isGenerating) {
        return res.status(429).send('Another fractal is currently generating. Try again later.');
    }

    const options = {
        width: parseInt(req.query.width) || 1920,
        height: parseInt(req.query.height) || 1080,
        maxIterations: parseInt(req.query.iterations) || 500,
        power: parseInt(req.query.power) || 2,
        c: {
            real: parseFloat(req.query.real) || 0.285,
            imag: parseFloat(req.query.imag) || 0.01
        },
        scale: parseFloat(req.query.scale) || 1,
        offsetX: parseFloat(req.query.offsetX) || 0,
        offsetY: parseFloat(req.query.offsetY) || 0,
        colorScheme: req.query.color || 'rainbow',
        debugLog // pass the debug callback to fractal.js
    };

    isGenerating = true;

    // Print the options if debugging
    if (DEBUG) {
        debugLog('Starting fractal generation with options:', options);
    }

    let buffer;
    try {
        buffer = await generateFractal(options);
    } catch (err) {
        isGenerating = false;
        console.error(err);
        if (DEBUG) console.log(); // new line after error
        return res.status(500).send('Fractal generation failed');
    }

    isGenerating = false;

    if (!buffer) {
        if (DEBUG) console.log('Fractal generation aborted due to time limit.\n'); // new line
        return res.status(499).send('Fractal generation aborted due to time limit.');
    }

    if (DEBUG) console.log('Fractal generation finished successfully.\n'); // new line

    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
});

app.listen(port, () => {
    debugLog(`Fractal API running on port ${port}`);
});