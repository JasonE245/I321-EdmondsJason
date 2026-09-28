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
CREATE TABLE IF NOT EXISTS pizzas_has_ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pizza_id INTEGER NOT NULL,
    ingredients_id INTEGER,
    UNIQUE (pizza_id, ingredients_id),
    FOREIGN KEY (pizza_id)
        REFERENCES pizzas (id)
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (ingredients_id)
        REFERENCES ingredients (id)
        ON DELETE NO ACTION ON UPDATE NO ACTION
    );
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