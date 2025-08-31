const db = require('../database.js');
const User = require('../users.js'); // Keep this import, though not directly used in getAllHistory anymore

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

exports.getHistoryEntryByUserAndFractal = (userId, fractalId, callback) => {
    const sql = "SELECT generated_at FROM history WHERE user_id = ? AND fractal_id = ?";
    db.get(sql, [userId, fractalId], callback);
};

exports.countHistoryByFractalId = (fractalId, callback) => {
    const sql = "SELECT COUNT(*) as count FROM history WHERE fractal_id = ?";
    db.get(sql, [fractalId], callback);
};

exports.getAllHistory = (filters, sortBy, sortOrder, limit, offset, callback) => {
    let whereClauses = [];
    let params = [];

    // Add a JOIN clause for the fractals table
    let joinSql = `LEFT JOIN fractals f ON h.fractal_id = f.id`;

    // No username filter, so no conditional join or where clause for username

    const whereSql = whereClauses.length > 0 ? `WHERE ` + whereClauses.join(` AND `) : ``;

    const countSql = `SELECT COUNT(*) as totalCount FROM history h ${joinSql} ${whereSql}`;
    db.get(countSql, params, (err, row) => {
        if (err) return callback(err);
        const totalCount = row.totalCount;

        const dataSql = `
            SELECT h.id, h.user_id, h.fractal_id, f.hash, f.width, f.height, f.iterations, f.power, f.c_real, f.c_imag, f.scale, f.offsetX, f.offsetY, f.colorScheme, h.generated_at
            FROM history h
            ${joinSql}
            ${whereSql}
            ORDER BY ${sortBy} ${sortOrder}
        `;
        let query = dataSql;
        let queryParams = [...params];

        if (limit > 0) {
            query += ' LIMIT ? OFFSET ?';
            queryParams.push(limit, offset);
        }

        db.all(query, queryParams, (err, rows) => {
            if (err) return callback(err);
            callback(null, rows, totalCount);
        });
    });
};

exports.countByUserId = (userId, callback) => {
    const sql = "SELECT COUNT(*) as count FROM history WHERE user_id = ?";
    db.get(sql, [userId], callback);
};