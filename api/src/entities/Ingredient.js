// entities/Ingredient.js
const db = require('../config/database');

class Ingredient {
    static create({ name, price }) {
        const sql = `INSERT INTO ingredients (name, price, created_at, updated_at)
                     VALUES (?, ?, datetime('now'), datetime('now'))`;
        const params = [name, price];

        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) return reject(err);
                Ingredient.findById(this.lastID).then(resolve).catch(reject);
            });
        });
    }

    static findAll() {
        const sql = `SELECT * FROM ingredients ORDER BY id DESC`;
        return new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    static findById(id) {
        const sql = `SELECT * FROM ingredients WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.get(sql, [id], (err, row) => {
                if (err) return reject(err);
                resolve(row || null);
            });
        });
    }

    static update(id, { name, price }) {
        const sql = `
            UPDATE ingredients
            SET name = COALESCE(?, name),
                price = COALESCE(?, price),
                updated_at = datetime('now')
            WHERE id = ?
        `;
        const params = [name, price, id];

        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) return reject(err);
                if (this.changes === 0) return resolve(null);
                Ingredient.findById(id).then(resolve).catch(reject);
            });
        });
    }

    static delete(id) {
        const sql = `DELETE FROM ingredients WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.run(sql, [id], function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    }
}

module.exports = Ingredient;