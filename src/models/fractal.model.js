const db = require('../database.js');

exports.findFractalByHash = (hash, callback) => {
    const sql = "SELECT * FROM fractals WHERE hash = ?";
    db.get(sql, [hash], callback);
};

exports.createFractal = (data, callback) => {
    const now = Date.now(); // Get current timestamp
    const sql = `INSERT INTO fractals (hash, width, height, iterations, power, c_real, c_imag, scale, offsetX, offsetY, colorScheme, image_path, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [data.hash, data.width, data.height, data.maxIterations, data.power, data.c.real, data.c.imag, data.scale, data.offsetX, data.offsetY, data.colorScheme, data.imagePath, now];
    db.run(sql, params, function(err) {
        callback(err, { id: this.lastID });
    });
};

exports.getFractalImagePath = (id, callback) => {
    const sql = "SELECT image_path FROM fractals WHERE id = ?";
    db.get(sql, [id], callback);
};

exports.deleteFractal = (id, callback) => {
    const sql = "DELETE FROM fractals WHERE id = ?";
    db.run(sql, [id], callback);
};

exports.getAllFractals = ({ limit, offset, filters, sortBy, sortOrder }, callback) => {
    let sql = "SELECT * FROM fractals";
    const params = [];
    const filterClauses = [];

    if (filters.colorScheme) {
        filterClauses.push("colorScheme = ?");
        params.push(filters.colorScheme);
    }
    if (filters.power) {
        filterClauses.push("power = ?");
        params.push(filters.power);
    }
    if (filters.iterations) {
        filterClauses.push("iterations = ?");
        params.push(filters.iterations);
    }
    if (filters.width) {
        filterClauses.push("width = ?");
        params.push(filters.width);
    }
    if (filters.height) {
        filterClauses.push("height = ?");
        params.push(filters.height);
    }

    if (filterClauses.length > 0) {
        sql += " WHERE " + filterClauses.join(" AND ");
    }

    sql += ` ORDER BY ${sortBy} ${sortOrder}`;

    const countSql = `SELECT COUNT(*) as totalCount FROM fractals` + (filterClauses.length > 0 ? " WHERE " + filterClauses.join(" AND ") : "");

    db.get(countSql, params, (err, row) => {
        if (err) {
            return callback(err);
        }
        const totalCount = row.totalCount;

        sql += " LIMIT ? OFFSET ?";
        params.push(limit, offset);

        db.all(sql, params, (err, rows) => {
            callback(err, rows, totalCount);
        });
    });
};

exports.getFractalById = (id, callback) => {
    const sql = "SELECT * FROM fractals WHERE id = ?";
    db.get(sql, [id], callback);
};

exports.searchFractals = (query, callback) => {
    const sql = "SELECT * FROM fractals WHERE hash LIKE ? OR colorScheme LIKE ?";
    const searchTerm = `%${query}%`;
    db.all(sql, [searchTerm, searchTerm], callback);
};