// routes/router.js
const express = require('express');
const pizzasRouter = require('./pizzas');

const router = express.Router();

router.use('/pizzas', pizzasRouter);

module.exports = router;