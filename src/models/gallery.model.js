const db = require('../database.js');
const users = require('../users.js'); // For mapping user_id to username in getGalleryForUser

exports.addToGallery = (userId, fractalId, fractalHash, callback) => {
    const sql = "INSERT OR IGNORE INTO gallery (user_id, fractal_id, fractal_hash) VALUES (?, ?, ?)";
    db.run(sql, [userId, fractalId, fractalHash], callback);
};

exports.getGalleryForUser = (userId, callback) => {
    const sql = `
        SELECT g.id, f.hash, f.width, f.height, f.iterations, f.power, f.c_real, f.c_imag, f.scale, f.offsetX, f.offsetY, f.colorScheme, g.added_at, g.fractal_hash
        FROM gallery g
        JOIN fractals f ON g.fractal_id = f.id
        WHERE g.user_id = ?
        ORDER BY g.added_at DESC
    `;
    db.all(sql, [userId], callback);
};

exports.getGalleryEntry = (id, userId, isAdmin, callback) => {
    let sql;
    let params;
    if (isAdmin) {
        sql = "SELECT fractal_id, fractal_hash FROM gallery WHERE id = ?";
        params = [id];
    } else {
        sql = "SELECT fractal_id, fractal_hash FROM gallery WHERE id = ? AND user_id = ?";
        params = [id, userId];
    }
    db.get(sql, params, callback);
};

exports.deleteGalleryEntry = (id, userId, isAdmin, callback) => {
    let sql;
    let params;
    if (isAdmin) {
        sql = "DELETE FROM gallery WHERE id = ?";
        params = [id];
    } else {
        sql = "DELETE FROM gallery WHERE id = ? AND user_id = ?";
        params = [id, userId];
    }
    db.run(sql, params, callback);
};

exports.countGalleryByFractalHash = (fractalHash, callback) => {
    const sql = "SELECT COUNT(*) as count FROM gallery WHERE fractal_hash = ?";
    db.get(sql, [fractalHash], callback);
};

exports.getAllGallery = (callback) => {
    const sql = `
        SELECT g.id, g.user_id, f.hash, f.width, f.height, f.iterations, f.power, f.c_real, f.c_imag, f.scale, f.offsetX, f.offsetY, f.colorScheme, g.added_at, g.fractal_hash
        FROM gallery g
        JOIN fractals f ON g.fractal_id = f.id
        ORDER BY g.added_at DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return callback(err);
        // Manually map user_id to username
        const galleryWithUsernames = rows.map(row => {
            const user = users.find(u => u.id === row.user_id);
            return { ...row, username: user ? user.username : 'Unknown' };
        });
        callback(null, galleryWithUsernames);
    });
};