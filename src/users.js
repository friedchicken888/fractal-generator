const db = require('./database');

const User = {
    findByUsername: (username, callback) => {
        db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
            callback(err, row);
        });
    },

    findById: (id, callback) => {
        db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
            callback(err, row);
        });
    },

    update: (id, updates, callback) => {
        let query = 'UPDATE users SET ';
        let params = [];
        let setParts = [];

        for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
                setParts.push(`${key} = ?`);
                params.push(updates[key]);
            }
        }

        query += setParts.join(', ') + ' WHERE id = ?';
        params.push(id);

        db.run(query, params, function(err) {
            callback(err, this.changes);
        });
    },

    getAll: (limit, offset, callback) => {
        const countSql = `SELECT COUNT(*) as totalCount FROM users`;
        db.get(countSql, [], (err, countRow) => {
            if (err) return callback(err);
            const totalCount = countRow.totalCount;

            let dataSql = `SELECT id, username, role, can_generate_fractals FROM users`;
            let params = [];

            if (limit > 0) {
                dataSql += ' LIMIT ? OFFSET ?';
                params.push(limit, offset);
            }

            db.all(dataSql, params, (err, rows) => {
                callback(err, rows, totalCount);
            });
        });
    }
};

module.exports = User;
