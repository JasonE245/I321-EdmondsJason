// entities/Pizza.js
const db = require('../config/database');

class Pizza {
    static create({ name, ingredients, imageUrl, price }) {
        const sql = `INSERT INTO pizzas (name, ingredients, imageUrl, price, created_at, updated_at)
                 VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`;
        const params = [name, ingredients || null, imageUrl || null, price];

        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) return reject(err);
                Pizza.findById(this.lastID).then(resolve).catch(reject);
            });
        });
    }

    static findAll() {
        const sql = `SELECT * FROM pizzas ORDER BY id DESC`;
        return new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    static findById(id) {
        const sql = `SELECT * FROM pizzas WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.get(sql, [id], (err, row) => {
                if (err) return reject(err);
                resolve(row || null);
            });
        });
    }

    static update(id, { name, ingredients, imageUrl, price }) {
        const sql = `
      UPDATE pizzas
      SET name = COALESCE(?, name),
          ingredients = COALESCE(?, ingredients),
          imageUrl = COALESCE(?, imageUrl),
          price = COALESCE(?, price),
          updated_at = datetime('now')
      WHERE id = ?
    `;
        const params = [name, ingredients, imageUrl, price, id];

        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) return reject(err);
                if (this.changes === 0) return resolve(null);
                Pizza.findById(id).then(resolve).catch(reject);
            });
        });
    }

    static delete(id) {
        const sql = `DELETE FROM pizzas WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.run(sql, [id], function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    }
}

module.exports = Pizza;