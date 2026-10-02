// entities/Pizza.js
const db = require('../config/database');

// Petits utilitaires pour éviter les callbacks imbriqués
function run(sql, params) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

function all(sql, params) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
    });
}

function get(sql, params) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row || null)));
    });
}

// Ajoute à la pizza la liste des ids d'ingrédients liés (les détails vivent dans ms-ingredients)
async function attachIngredientIds(pizza) {
    const rows = await all(
        `SELECT ingredients_id FROM pizzas_has_ingredients WHERE pizza_id = ?`,
        [pizza.id]
    );
    const ingredientIds = [];
    for (let i = 0; i < rows.length; i++) {
        ingredientIds.push(rows[i].ingredients_id);
    }
    return { ...pizza, ingredientIds };
}

class Pizza {
    static findByName(name) {
        return get(`SELECT * FROM pizzas WHERE name = ?`, [name]);
    }

    static async create({ name, imageUrl, price, ingredientIds = [] }) {
        const result = await run(
            `INSERT INTO pizzas (name, imageUrl, price, created_at, updated_at)
             VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
            [name, imageUrl || null, price]
        );
        await Pizza.setIngredientIds(result.lastID, ingredientIds);
        return Pizza.findById(result.lastID);
    }

    static async findAll() {
        const pizzas = await all(`SELECT * FROM pizzas ORDER BY id DESC`, []);
        const result = [];
        for (let i = 0; i < pizzas.length; i++) {
            result.push(await attachIngredientIds(pizzas[i]));
        }
        return result;
    }

    static async findById(id) {
        const pizza = await get(`SELECT * FROM pizzas WHERE id = ?`, [id]);
        if (!pizza) return null;
        return attachIngredientIds(pizza);
    }

    static async update(id, { name, imageUrl, price, ingredientIds }) {
        const result = await run(
            `UPDATE pizzas
             SET name = COALESCE(?, name),
                 imageUrl = COALESCE(?, imageUrl),
                 price = COALESCE(?, price),
                 updated_at = datetime('now')
             WHERE id = ?`,
            [name, imageUrl, price, id]
        );
        if (result.changes === 0) return null;

        // undefined = on ne touche pas aux liens ; un tableau (même vide) remplace les liens existants
        if (ingredientIds !== undefined) {
            await Pizza.setIngredientIds(id, ingredientIds);
        }
        return Pizza.findById(id);
    }

    static async delete(id) {
        // Suppression explicite des liens : SQLite n'applique pas ON DELETE CASCADE sans PRAGMA foreign_keys
        await run(`DELETE FROM pizzas_has_ingredients WHERE pizza_id = ?`, [id]);
        const result = await run(`DELETE FROM pizzas WHERE id = ?`, [id]);
        return result.changes;
    }

    // Remplace tous les liens d'une pizza par la liste d'ids donnée
    static async setIngredientIds(pizzaId, ingredientIds) {
        await run(`DELETE FROM pizzas_has_ingredients WHERE pizza_id = ?`, [pizzaId]);
        for (let i = 0; i < ingredientIds.length; i++) {
            await run(
                `INSERT INTO pizzas_has_ingredients (pizza_id, ingredients_id) VALUES (?, ?)`,
                [pizzaId, ingredientIds[i]]
            );
        }
    }
}

module.exports = Pizza;