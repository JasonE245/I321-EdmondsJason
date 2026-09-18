// entities/Pizza.js
const db = require('../config/database');

function attachIngredients(pizza) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT i.id, i.name, i.price
            FROM ingredients i
            JOIN pizzas_has_ingredients phi ON phi.ingredients_id = i.id
            WHERE phi.pizza_id = ?
        `;
        db.all(sql, [pizza.id], (err, rows) => {
            if (err) return reject(err);
            resolve({ ...pizza, ingredients: rows });
        });
    });
}

class Pizza {
    static create({ name, imageUrl, price, ingredientIds = [] }) {
        const sql = `INSERT INTO pizzas (name, imageUrl, price, created_at, updated_at)
                     VALUES (?, ?, ?, datetime('now'), datetime('now'))`;

        return new Promise((resolve, reject) => {
            db.run(sql, [name, imageUrl || null, price], function (err) {
                if (err) return reject(err);
                const pizzaId = this.lastID;

                const links = ingredientIds.map((ingredientId) =>
                    new Promise((res, rej) => {
                        db.run(
                            `INSERT INTO pizzas_has_ingredients (pizza_id, ingredients_id) VALUES (?, ?)`,
                            [pizzaId, ingredientId],
                            (err) => (err ? rej(err) : res())
                        );
                    })
                );

                Promise.all(links)
                    .then(() => Pizza.findById(pizzaId))
                    .then(resolve)
                    .catch(reject);
            });
        });
    }

    static async findAll() {
        const sql = `SELECT * FROM pizzas ORDER BY id DESC`;
        const pizzas = await new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows) => (err ? reject(err) : resolve(rows)));
        });
        return Promise.all(pizzas.map(attachIngredients));
    }

    static async findById(id) {
        const sql = `SELECT * FROM pizzas WHERE id = ?`;
        const pizza = await new Promise((resolve, reject) => {
            db.get(sql, [id], (err, row) => (err ? reject(err) : resolve(row || null)));
        });
        if (!pizza) return null;
        return attachIngredients(pizza);
    }

    static findByName(name) {
        const sql = `SELECT * FROM pizzas WHERE name = ?`;
        return new Promise((resolve, reject) => {
            db.get(sql, [name], (err, row) => {
                if (err) return reject(err);
                resolve(row || null);
            });
        });
    }

    static update(id, { name, imageUrl, price, ingredientIds }) {
        const sql = `
            UPDATE pizzas
            SET name = COALESCE(?, name),
                imageUrl = COALESCE(?, imageUrl),
                price = COALESCE(?, price),
                updated_at = datetime('now')
            WHERE id = ?
        `;
        return new Promise((resolve, reject) => {
            db.run(sql, [name, imageUrl, price, id], async function (err) {
                if (err) return reject(err);
                if (this.changes === 0) return resolve(null);

                try {
                    if (ingredientIds !== undefined) {
                        await new Promise((res, rej) => {
                            db.run(`DELETE FROM pizzas_has_ingredients WHERE pizza_id = ?`, [id], (err) =>
                                err ? rej(err) : res()
                            );
                        });
                        for (const ingredientId of ingredientIds) {
                            await new Promise((res, rej) => {
                                db.run(
                                    `INSERT INTO pizzas_has_ingredients (pizza_id, ingredients_id) VALUES (?, ?)`,
                                    [id, ingredientId],
                                    (err) => (err ? rej(err) : res())
                                );
                            });
                        }
                    }
                    const updated = await Pizza.findById(id);
                    resolve(updated);
                } catch (e) {
                    reject(e);
                }
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