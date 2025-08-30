const fs = require('fs');
const { generateFractal } = require('./fractal');

// Options for testing
const options = {
    width: 1920,
    height: 1080,
    maxIterations: 3000,
    power: 2,
    c: { real: 0.285, imag: 0.01 },
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    colorScheme: 'rainbow'
};

console.log('Starting fractal generation with options:', options);

const startTime = Date.now();

// Generate the fractal
const buffer = generateFractal(options);

const endTime = Date.now();
const duration = ((endTime - startTime) / 1000).toFixed(2);

fs.writeFileSync('test_fractal.png', buffer);

console.log(`Fractal generated and saved as test_fractal.png in ${duration} seconds`);
