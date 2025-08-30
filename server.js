const express = require('express');
const { generateFractal } = require('./fractal');
const app = express();
const port = 3000;

// Global state for cancellation
let cancelFlag = false;
let isGenerating = false;

// Endpoint to generate a fractal
app.get('/fractal', async (req, res) => {
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
        cancelCallback: () => cancelFlag // <-- pass cancel callback to fractal
    };

    // console.log('Starting fractal generation with options:', options);
    cancelFlag = false;
    isGenerating = true;

    try {
        // Wrap synchronous fractal generation in a Promise for async handling
        const buffer = await new Promise((resolve) => {
            resolve(generateFractal(options));
        });

        isGenerating = false;

        if (buffer) {
            res.setHeader('Content-Type', 'image/png');
            res.send(buffer);
        } else {
            res.status(499).send('Fractal generation cancelled');
        }
    } catch (err) {
        isGenerating = false;
        console.error('Error generating fractal:', err);
        res.status(500).send('Fractal generation failed');
    }
});

// Endpoint to cancel the current generation
app.get('/cancel', (req, res) => {
    if (!isGenerating) {
        return res.send('No fractal is currently generating.');
    }
    cancelFlag = true;
    // console.log('Fractal generation cancelled by user.');
    res.send('Cancel request received. The current fractal will stop shortly.');
});

// Start the server
app.listen(port, () => {
    console.log(`Fractal API running`);
});
