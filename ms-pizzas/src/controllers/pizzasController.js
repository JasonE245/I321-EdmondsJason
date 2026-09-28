// controllers/pizzasController.js
const { validationResult } = require('express-validator');
const Pizza = require('../entities/Pizza');
const { existsByNames } = require('./ingredientsController');

exports.create = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, imageUrl, price, ingredients = [] } = req.body;

        const existingPizza = await Pizza.findByName(name);
        if (existingPizza) {
            return res.status(409).json({ error: 'Pizza name already exists' });
        }

        const { valid, missing, found } = await existsByNames(ingredients);
        if (!valid) {
            return res.status(400).json({ error: 'Unknown ingredient(s)', missing });
        }

        const ingredientIds = found.map((i) => i.id);
        const created = await Pizza.create({ name, imageUrl, price, ingredientIds });
        return res.status(201).json(created);
    } catch (err) {
        next(err);
    }
};

exports.findAll = async (req, res, next) => {
    try {
        const pizzas = await Pizza.findAll();
        return res.status(200).json(pizzas);
    } catch (err) {
        next(err);
    }
};

exports.findOne = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid pizza id' });

        const pizza = await Pizza.findById(id);
        if (!pizza) return res.status(404).json({ error: 'Pizza not found' });

        return res.status(200).json(pizza);
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid pizza id' });

        const { name, ingredients, imageUrl, price } = req.body;
        const updated = await Pizza.update(id, { name, ingredients, imageUrl, price });
        if (!updated) return res.status(404).json({ error: 'Pizza not found' });

        return res.status(200).json(updated);
    } catch (err) {
        next(err);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid pizza id' });

        const deleted = await Pizza.delete(id);
        if (deleted === 0) return res.status(404).json({ error: 'Pizza not found' });

        return res.status(204).send();
    } catch (err) {
        next(err);
    }
};