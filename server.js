const express = require('express');
const { generateFractal } = require('./fractal');
const app = express();
const port = 3000;

// Global state
let cancelFlag = false;
let isGenerating = false;

app.get('/fractal', async (req, res) => {
    if (isGenerating) return res.status(429).send('Another fractal is currently generating.');

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
        colorScheme: req.query.color || 'rainbow'
    };

    cancelFlag = false;
    isGenerating = true;

    try {
        const buffer = await generateFractal({ ...options, cancelCallback: () => cancelFlag });
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

app.get('/cancel', (req, res) => {
    if (!isGenerating) {
        console.log('Cancel request received, but no fractal is generating.');
        return res.send('No fractal is currently generating.');
    }
    cancelFlag = true;
    console.log('Cancel request received. Fractal generation will stop shortly.');
    res.send('Cancel request received. The current fractal will stop shortly.');
});

app.listen(port, () => {
    console.log(`Fractal API running on port ${port}`);
});
