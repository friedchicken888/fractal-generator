const express = require('express');
const { generateFractal } = require('./fractal');
const app = express();
const port = 3000;

app.get('/fractal', (req, res) => {
    const options = {
        width: parseInt(req.query.width) || 1920,
        height: parseInt(req.query.height) || 1080,
        maxIterations: parseInt(req.query.iterations) || 100,
        power: parseInt(req.query.power) || 2,
        c: {
            real: parseFloat(req.query.real) || -0.7,
            imag: parseFloat(req.query.imag) || 0.27015
        },
        scale: parseFloat(req.query.scale) || 0.5,
        offsetX: parseFloat(req.query.offsetX) || 0.5,
        offsetY: parseFloat(req.query.offsetY) || -0.1,
        colorScheme: req.query.color || "rainbow"
    };

    console.log("Generating fractal with options:", options);

    const buffer = generateFractal(options);
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
});

app.listen(port, () => {
    console.log(`🚀 Fractal API running on port:${port}`);
});
