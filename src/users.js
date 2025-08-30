const bcrypt = require('bcryptjs');

// Hardcoded users with hashed passwords
const users = [
    {
        id: 1,
        username: 'user',
        password: bcrypt.hashSync('user', 8), // hashed
        role: 'user'
    },
    {
        id: 2,
        username: 'admin',
        password: bcrypt.hashSync('admin', 8),
        role: 'admin'
    }
];

module.exports = users;
