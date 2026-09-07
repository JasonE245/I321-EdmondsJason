// app.js
const express = require('express');
const morgan = require('morgan');
const router = require('./routes/router');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.use('/api', router);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.get('/', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
    console.error(err);
    if (!res.headersSent) {
        res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
    } else next(err);
});

module.exports = app;