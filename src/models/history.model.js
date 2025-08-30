const db = require('../database.js');
const users = require('../users.js'); // For mapping user_id to username in getGalleryForUser

exports.getHistoryForUser = (userId, callback) => {
    const sql = `
        SELECT h.id, f.hash, f.width, f.height, f.iterations, f.power, f.c_real, f.c_imag, f.scale, f.offsetX, f.offsetY, f.colorScheme, h.generated_at
        FROM history h
        JOIN fractals f ON h.fractal_id = f.id
        WHERE h.user_id = ?
        ORDER BY h.generated_at DESC
    `;
    db.all(sql, [userId], callback);
};

exports.createHistoryEntry = (userId, fractalId, callback) => {
    const sql = "INSERT INTO history (user_id, fractal_id) VALUES (?, ?)";
    db.run(sql, [userId, fractalId], callback);
};

exports.getHistoryEntry = (id, userId, callback) => {
    const sql = "SELECT fractal_id FROM history WHERE id = ? AND user_id = ?";
    db.get(sql, [id, userId], callback);
};

exports.deleteHistoryEntry = (id, callback) => {
    const sql = "DELETE FROM history WHERE id = ?";
    db.run(sql, [id], callback);
};

exports.countHistoryByFractalId = (fractalId, callback) => {
    const sql = "SELECT COUNT(*) as count FROM history WHERE fractal_id = ?";
    db.get(sql, [fractalId], callback);
};

exports.getAllHistory = (callback) => {
    const sql = `
        SELECT h.id, h.user_id, f.hash, f.width, f.height, f.iterations, f.power, f.c_real, f.c_imag, f.scale, f.offsetX, f.offsetY, f.colorScheme, h.generated_at
        FROM history h
        LEFT JOIN fractals f ON h.fractal_id = f.id
        ORDER BY h.generated_at DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return callback(err);
        // Manually map user_id to username
        const historyWithUsernames = rows.map(row => {
            const user = users.find(u => u.id === row.user_id);
            return { ...row, username: user ? user.username : 'Unknown' };
        });
        callback(null, historyWithUsernames);
    });
};