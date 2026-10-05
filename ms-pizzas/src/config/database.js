// config/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbFile = process.env.DB_FILE || path.join(__dirname, '..', '..', 'dev.sqlite');

const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('Could not connect to sqlite', err);
        process.exit(1);
    }
    console.log('Connected to sqlite database:', dbFile);
});

const initSql = `
CREATE TABLE IF NOT EXISTS pizzas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    ingredients TEXT,
    imageUrl TEXT,
    price REAL NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
    );

CREATE TABLE IF NOT EXISTS pizzas_has_ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pizza_id INTEGER NOT NULL,
    ingredients_id INTEGER,
    UNIQUE (pizza_id, ingredients_id),
    FOREIGN KEY (pizza_id)
        REFERENCES pizzas (id)
        ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS fk_pizza_has_ingredients_pizzas_idx ON pizzas_has_ingredients (pizza_id);

    CREATE INDEX IF NOT EXISTS fk_pizza_has_ingredients_ingredients_idx ON pizzas_has_ingredients (ingredients_id);
`;

db.serialize(() => {
    db.exec(initSql, (err) => {
        if (err) {
            console.error('Failed to initialize database', err);
            process.exit(1);
        }
    });
});

module.exports = db;