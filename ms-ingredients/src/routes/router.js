// routes/router.js
const express = require('express');
const ingredientsRouter = require('./ingredients');

const router = express.Router();

router.use('/ingredients', ingredientsRouter);

module.exports = router;