const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../users');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    User.findByUsername(username, (err, user) => {
        if (err) {
            console.error("Database error during login:", err);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (!user) {
            return res.status(401).send('Invalid username or password');
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).send('Invalid username or password');
        }

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role, can_generate_fractals: user.can_generate_fractals }, JWT_SECRET, {
            expiresIn: '1h'
        });

        res.json({ token });
    });
});

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send('Access denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).send('Invalid token.');
    }
}

function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('Access denied. Admin privileges required.');
    }
}

module.exports = { router, verifyToken, isAdmin };

