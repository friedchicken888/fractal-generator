const express = require('express');
const { generateFractal } = require('./fractal');
const fs = require('fs');
const app = express();
const port = 3000;

// Debug flag
const DEBUG = false; // <-- set to false to disable logs

let isGenerating = false;

function debugLog(...args) {
    if (DEBUG) console.log(...args);
}

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
        colorScheme: req.query.color || 'rainbow'
    };

    isGenerating = true;
    let buffer;
    try {
        buffer = await generateFractal(options, debugLog);
    } catch (err) {
        isGenerating = false;
        console.error(err);
        return res.status(500).send('Fractal generation failed');
    }
    isGenerating = false;

    if (!buffer) {
        return res.status(499).send('Fractal generation aborted due to time limit.');
    }

    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
});

app.listen(port, () => {
    debugLog(`Fractal API running`);
});
