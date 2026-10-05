// config/swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Pizzas API',
            version: '1.0.0',
            description: 'RESTful API for managing the pizza menu (Foodtruck project).'
        },
        servers: [
            { url: 'http://localhost:3000', description: 'Local dev server' }
        ]
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js']
};

module.exports = swaggerJSDoc(options);