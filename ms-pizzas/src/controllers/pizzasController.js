// controllers/pizzasController.js
// Couche présentation : validation de la requête, appel du service, code HTTP de la réponse
const { validationResult } = require('express-validator');
const PizzaService = require('../services/pizzaService');

/**
 * Traduit une erreur du service en réponse HTTP, ou la passe au gestionnaire global.
 * :param err: erreur levée par le service
 * :param res: réponse Express
 * :param next: fonction next d'Express
 * :return: la réponse envoyée, ou l'appel à next
 */
function handleError(err, res, next) {
    // Erreur métier typée (400, 409, 502, 503) : on la renvoie telle quelle
    if (err.status) {
        return res.status(err.status).json({ error: err.message, ...err.details });
    }
    // Erreur inattendue : gestionnaire global de app.js (500)
    return next(err);
}

/**
 * POST /api/pizzas
 * :return: 201 + pizza, ou 400 / 409 / 502 / 503
 */
exports.create = async (req, res, next) => {
    try {
        // Erreurs d'express-validator (paramètres manquants ou du mauvais type)
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const created = await PizzaService.create(req.body);
        return res.status(201).json(created);
    } catch (err) {
        return handleError(err, res, next);
    }
};

/**
 * GET /api/pizzas
 * :return: 200 + tableau de pizzas, ou 502 / 503
 */
exports.findAll = async (req, res, next) => {
    try {
        const pizzas = await PizzaService.getAll();
        return res.status(200).json(pizzas);
    } catch (err) {
        return handleError(err, res, next);
    }
};

/**
 * GET /api/pizzas/:id
 * :return: 200 + pizza, 400 si id invalide, 404 si introuvable
 */
exports.findOne = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid pizza id' });

        const pizza = await PizzaService.getById(id);
        if (!pizza) return res.status(404).json({ error: 'Pizza not found' });
        return res.status(200).json(pizza);
    } catch (err) {
        return handleError(err, res, next);
    }
};

/**
 * PUT /api/pizzas/:id
 * :return: 200 + pizza, 400 / 404 / 409 / 502 / 503
 */
exports.update = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid pizza id' });

        const updated = await PizzaService.update(id, req.body);
        if (!updated) return res.status(404).json({ error: 'Pizza not found' });
        return res.status(200).json(updated);
    } catch (err) {
        return handleError(err, res, next);
    }
};

/**
 * DELETE /api/pizzas/:id
 * :return: 204 si supprimée, 400 si id invalide, 404 si introuvable
 */
exports.delete = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid pizza id' });

        const deleted = await PizzaService.remove(id);
        if (deleted === 0) return res.status(404).json({ error: 'Pizza not found' });
        return res.status(204).send();
    } catch (err) {
        return handleError(err, res, next);
    }
};