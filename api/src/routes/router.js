// routes/router.js
const express = require('express');
const pizzasRouter = require('./pizzas');
const ingredientsRouter = require('./ingredients');

const router = express.Router();

router.use('/pizzas', pizzasRouter);
router.use('/ingredients', ingredientsRouter);

module.exports = router;