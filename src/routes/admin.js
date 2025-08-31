const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('./auth');
const User = require('../users');

router.use(verifyToken);
router.use(isAdmin);

router.get('/users', (req, res) => {
    let limit = parseInt(req.query.limit);
    if (req.user.role === 'admin' && limit === 0) {
        limit = null; // No limit for admins when 0 is provided
    } else if (isNaN(limit)) {
        limit = 5; // Default limit
    }
    const offset = parseInt(req.query.offset) || 0;

    User.getAll(limit, offset, (err, usersData, totalCount) => {
        if (err) {
            console.error("Database error retrieving users:", err);
            return res.status(500).send("Internal server error");
        }
        const usersWithoutPasswords = usersData.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        res.json({ data: usersWithoutPasswords, totalCount, limit, offset });
    });
});

router.put('/users/:id/toggle-generation', (req, res) => {
    const userId = parseInt(req.params.id);

    User.findById(userId, (err, user) => {
        if (err) {
            console.error("Database error finding user:", err);
            return res.status(500).send("Internal server error");
        }

        if (!user) {
            return res.status(404).send('User not found');
        }

        if (user.role === 'admin') {
            return res.status(403).send('Cannot modify admin generation status via this endpoint.');
        }

        const newStatus = user.can_generate_fractals === 1 ? 0 : 1;

        User.update(userId, { can_generate_fractals: newStatus }, (err, changes) => {
            if (err) {
                console.error("Database error updating user:", err);
                return res.status(500).send("Internal server error");
            }
            if (changes === 0) {
                return res.status(404).send('User not found or no changes made.');
            }
            res.json({ message: `User ${user.username} fractal generation toggled to ${newStatus === 1 ? true : false}`, can_generate_fractals: newStatus === 1 ? true : false });
        });
    });
});

module.exports = router;