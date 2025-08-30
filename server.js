require('dotenv').config();
const express = require('express');
const fs = require('fs');
const authRouter = require('./src/routes/auth').router;
const fractalRouter = require('./src/routes/fractal');
const historyRouter = require('./src/routes/history');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Serve static fractal images
app.use('/fractals', express.static('fractals'));

// Create fractals directory if it doesn't exist
const fractalsDir = './fractals';
if (!fs.existsSync(fractalsDir)){
    fs.mkdirSync(fractalsDir);
}

// Routes
app.use('/api/auth', authRouter);
app.use('/api', fractalRouter);
app.use('/api', historyRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
