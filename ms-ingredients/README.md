# Ingredients Microservice

RESTful microservice that manages the ingredients of the Foodtruck project, built with **Express**, **SQLite3**, **express-validator**, and documented with **Swagger UI**.

It is independent: it does not call any other service. The **ms-pizzas** microservice calls it to validate and display the ingredients of a pizza.

---

## Requirements

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

---

## Project structure

```
ms-ingredients
│   .env
│   .env.example
│   .gitignore
│   dev.sqlite
│   package-lock.json
│   package.json
│   README.md
│
└───src
    │   app.js
    │   server.js
    │
    ├───config
    │       database.js
    │       swagger.js
    │
    ├───controllers
    │       ingredientsController.js
    │
    ├───entities
    │       Ingredient.js
    │
    └───routes
            ingredients.js
            router.js
```

Layers: **routes** (validation rules) → **controller** (HTTP in/out) → **entity** (SQL).

## Installation

```bash
npm install
```

Then create a `.env` file from the example:

```bash
cp .env.example .env
```

## Environment

```bash
PORT=3002
DB_FILE=./dev.sqlite
NODE_ENV=development
CORS_ORIGIN=*
```

## Running

This service has no dependency, start it **before** ms-pizzas:

```bash
npm run dev
```

`npm run dev` restarts automatically on changes (nodemon). `npm start` runs it once.

## Usage

- API base URL: http://localhost:3002/api
- Swagger UI: http://localhost:3002/docs

## Routes

| Method | Path | Description | Success | Errors |
|--------|------|-------------|---------|--------|
| GET | `/api/ingredients` | List ingredients | 200 | |
| GET | `/api/ingredients/{id}` | Get one ingredient | 200 | 400, 404 |
| POST | `/api/ingredients` | Create an ingredient | 201 | 400 |
| PUT | `/api/ingredients/{id}` | Update an ingredient | 200 | 400, 404 |
| DELETE | `/api/ingredients/{id}` | Delete an ingredient | 204 | 400, 404 |

Example of an ingredient in a response:

```json
{
  "id": 4,
  "name": "Jambon",
  "price": 2,
  "created_at": "2026-10-02 09:31:11",
  "updated_at": "2026-10-02 09:31:11"
}
```

## Data

Ingredient names are unique. Deleting an ingredient here does not remove it from the pizzas that reference it in ms-pizzas: those pizzas keep the ingredient id but lose its name and price in the responses.