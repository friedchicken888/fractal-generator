function generateFractal({
    width = 800,
    height = 600,
    maxIterations = 500,
    power = 2,
    c = { real: 0.285, imag: 0.01 },
    scale = 1.5,
    offsetX = 0,
    offsetY = 0,
    colorScheme = "rainbow",
    cancelCallback = null
}) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {

            let z = {
                real: map(x, 0, width, -scale + offsetX, scale + offsetX),
                imag: map(y, 0, height, -scale + offsetY, scale + offsetY)
            };

            let n = 0;
            while (n < maxIterations) {
                if (cancelCallback && cancelCallback()) {
                    console.log('Fractal generation cancelled!');
                    return null;
                }

                z = iterate(z, c, power);
                if ((z.real * z.real + z.imag * z.imag) > 4) break;
                n++;
            }

            // Smooth iteration count
            let mu = n;
            if (n < maxIterations) {
                mu = n + 1 - Math.log(Math.log(Math.sqrt(z.real * z.real + z.imag * z.imag))) / Math.log(power);
            }

            const color = getColor(mu, maxIterations, colorScheme);
            const idx = (y * width + x) * 4;
            data[idx] = color[0];
            data[idx + 1] = color[1];
            data[idx + 2] = color[2];
            data[idx + 3] = color[3];
        }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toBuffer('image/png');
}
