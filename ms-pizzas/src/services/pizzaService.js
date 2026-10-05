// services/pizzaService.js
// Couche métier : règles de gestion des pizzas + appels HTTP vers ms-ingredients
const Pizza = require('../entities/Pizza');

// Adresse de ms-ingredients et délai maximum d'attente (fetch natif, Node 18+)
const INGREDIENTS_SERVICE_URL = process.env.INGREDIENTS_SERVICE_URL || 'http://localhost:3002';
const TIMEOUT_MS = 3000;

/**
 * Fabrique une erreur portant un code HTTP, que le controller traduit en réponse.
 * :param status: code HTTP à renvoyer (400, 409, 502, 503)
 * :param message: message d'erreur
 * :param details: infos supplémentaires à ajouter à la réponse (ex: { missing: [...] })
 * :return: objet Error enrichi
 */
function httpError(status, message, details) {
    const err = new Error(message);
    err.status = status;
    err.details = details || {};
    return err;
}

/**
 * Récupère tous les ingrédients auprès de ms-ingredients.
 * :return: tableau d'ingrédients [{ id, name, price, ... }]
 */
async function fetchAllIngredients() {
    // Le délai maximum évite d'attendre indéfiniment si ms-ingredients ne répond pas
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const res = await fetch(`${INGREDIENTS_SERVICE_URL}/api/ingredients`, { signal: controller.signal });

        // Le service répond, mais avec une erreur : 502 Bad Gateway
        if (!res.ok) throw httpError(502, 'Ingredients service returned an error');
        return await res.json();
    } catch (e) {
        // Erreur déjà typée juste au-dessus : on la laisse remonter
        if (e.status) throw e;

        // Service éteint, injoignable ou trop lent : 503 Service Unavailable
        throw httpError(503, 'Ingredients service unavailable');
    } finally {
        clearTimeout(timer);
    }
}

/**
 * Transforme des noms d'ingrédients en ids, en repérant les noms inconnus.
 * :param names: tableau de noms demandés par le client
 * :param allIngredients: liste complète renvoyée par ms-ingredients
 * :return: { ids: [...], missing: [...] }
 */
function resolveIngredientNames(names, allIngredients) {
    const ids = [];
    const missing = [];

    // Pour chaque nom demandé, on cherche l'ingrédient correspondant
    for (let i = 0; i < names.length; i++) {
        let match = null;
        for (let j = 0; j < allIngredients.length; j++) {
            if (allIngredients[j].name === names[i]) {
                match = allIngredients[j];
                break;
            }
        }
        if (match) {
            ids.push(match.id);
        } else {
            missing.push(names[i]);
        }
    }
    return { ids, missing };
}

/**
 * Remplace ingredientIds par les ingrédients complets (id, name, price).
 * :param pizza: pizza issue de l'entité (avec ingredientIds)
 * :param allIngredients: liste complète renvoyée par ms-ingredients
 * :return: pizza avec le champ ingredients
 */
function withIngredients(pizza, allIngredients) {
    const { ingredientIds, ...rest } = pizza;
    const ingredients = [];

    for (let i = 0; i < ingredientIds.length; i++) {
        // Si l'ingrédient a été supprimé côté ms-ingredients, on garde au moins son id
        let found = { id: ingredientIds[i] };
        for (let j = 0; j < allIngredients.length; j++) {
            if (allIngredients[j].id === ingredientIds[i]) {
                found = {
                    id: allIngredients[j].id,
                    name: allIngredients[j].name,
                    price: allIngredients[j].price,
                };
                break;
            }
        }
        ingredients.push(found);
    }
    return { ...rest, ingredients };
}

const PizzaService = {
    /**
     * Liste toutes les pizzas avec leurs ingrédients.
     * :return: tableau de pizzas
     */
    async getAll() {
        const pizzas = await Pizza.findAll();
        // Un seul appel vers ms-ingredients pour toutes les pizzas
        const allIngredients = await fetchAllIngredients();

        const result = [];
        for (let i = 0; i < pizzas.length; i++) {
            result.push(withIngredients(pizzas[i], allIngredients));
        }
        return result;
    },

    /**
     * Récupère une pizza et ses ingrédients.
     * :param id: identifiant de la pizza
     * :return: la pizza, ou null si elle n'existe pas
     */
    async getById(id) {
        const pizza = await Pizza.findById(id);
        if (!pizza) return null;

        const allIngredients = await fetchAllIngredients();
        return withIngredients(pizza, allIngredients);
    },

    /**
     * Crée une pizza après avoir contrôlé le nom et les ingrédients.
     * :param data: { name, imageUrl, price, ingredients (noms) }
     * :return: la pizza créée
     */
    async create({ name, imageUrl, price, ingredients = [] }) {
        // 409 : nom de pizza déjà utilisé
        const existing = await Pizza.findByName(name);
        if (existing) throw httpError(409, 'Pizza name already exists');

        // 400 : un ou plusieurs ingrédients n'existent pas dans ms-ingredients
        const allIngredients = await fetchAllIngredients();
        const { ids, missing } = resolveIngredientNames(ingredients, allIngredients);
        if (missing.length > 0) throw httpError(400, 'Unknown ingredient(s)', { missing });

        const created = await Pizza.create({ name, imageUrl, price, ingredientIds: ids });
        return withIngredients(created, allIngredients);
    },

    /**
     * Met à jour une pizza (et ses ingrédients si fournis).
     * :param id: identifiant de la pizza
     * :param data: { name, imageUrl, price, ingredients (noms, optionnel) }
     * :return: la pizza modifiée, ou null si elle n'existe pas
     */
    async update(id, { name, imageUrl, price, ingredients }) {
        // 409 : le nouveau nom appartient déjà à une autre pizza
        if (name !== undefined) {
            const sameName = await Pizza.findByName(name);
            if (sameName && sameName.id !== id) throw httpError(409, 'Pizza name already exists');
        }

        const allIngredients = await fetchAllIngredients();

        // Les ingrédients ne sont résolus que s'ils sont présents dans la requête
        let ingredientIds;
        if (ingredients !== undefined) {
            const resolved = resolveIngredientNames(ingredients, allIngredients);
            if (resolved.missing.length > 0) {
                throw httpError(400, 'Unknown ingredient(s)', { missing: resolved.missing });
            }
            ingredientIds = resolved.ids;
        }

        const updated = await Pizza.update(id, { name, imageUrl, price, ingredientIds });
        if (!updated) return null;
        return withIngredients(updated, allIngredients);
    },

    /**
     * Supprime une pizza et ses liens.
     * :param id: identifiant de la pizza
     * :return: nombre de pizzas supprimées (0 si introuvable)
     */
    async remove(id) {
        return Pizza.delete(id);
    },
};

module.exports = PizzaService;