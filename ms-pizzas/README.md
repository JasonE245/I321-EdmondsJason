# Pizzas Microservice

RESTful microservice that manages the pizza menu of the Foodtruck project, built with **Express**, **SQLite3**, **express-validator**, and documented with **Swagger UI**.

It owns the `pizzas` data and the links between pizzas and ingredients. Ingredient details (name, price) are **not** stored here: they are fetched over HTTP from the **ms-ingredients** microservice.

---

## Requirements

- **Node.js**: v18.x or higher (native `fetch` is used to call ms-ingredients)
- **npm**: v9.x or higher
- **ms-ingredients** running (see below)

---

## Project structure

```
ms-pizzas
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
    │       pizzasController.js
    │
    ├───entities
    │       Pizza.js
    │
    ├───routes
    │       pizzas.js
    │       router.js
    │
    └───services
            pizzaService.js
```

Layers: **routes** (validation rules) → **controller** (HTTP in/out) → **service** (business rules, calls ms-ingredients) → **entity** (SQL).

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
PORT=3001
DB_FILE=./dev.sqlite
NODE_ENV=development
CORS_ORIGIN=*
INGREDIENTS_SERVICE_URL=http://localhost:3002
```

## Running

Start **ms-ingredients first** (port 3002), then this service:

```bash
npm run dev
```

`npm run dev` restarts automatically on changes (nodemon). `npm start` runs it once.

## Usage

- API base URL: http://localhost:3001/api
- Swagger UI: http://localhost:3001/docs

## Routes

| Method | Path | Description | Success | Errors |
|--------|------|-------------|---------|--------|
| GET | `/api/pizzas` | List pizzas with their ingredients | 200 | 502, 503 |
| GET | `/api/pizzas/{id}` | Get one pizza | 200 | 400, 404, 502, 503 |
| POST | `/api/pizzas` | Create a pizza | 201 | 400, 409, 502, 503 |
| PUT | `/api/pizzas/{id}` | Update a pizza | 200 | 400, 404, 409, 502, 503 |
| DELETE | `/api/pizzas/{id}` | Delete a pizza | 204 | 400, 404 |

Example of a pizza in a response:

```json
{
  "id": 2,
  "name": "4 Saisons",
  "ingredients": [
    { "id": 2, "name": "Champignons", "price": 1 },
    { "id": 3, "name": "Oignons", "price": 1 },
    { "id": 4, "name": "Jambon", "price": 2 }
  ],
  "imageUrl": null,
  "price": 17,
  "created_at": "2026-10-02 09:34:53",
  "updated_at": "2026-10-02 09:34:53"
}
```

Example of a creation request (ingredients are given **by name**):

```json
{
  "name": "Margherita",
  "price": 12,
  "imageUrl": "",
  "ingredients": ["Mozzarella"]
}
```

## Business rules on creation and update

- Missing or wrongly typed parameters: `400`
- Pizza name already used: `409`
- One or more ingredients unknown to ms-ingredients: `400` with the list of missing names
- ms-ingredients unreachable (or slower than 3 seconds): `503`
- ms-ingredients answers with an error: `502`

## Data

The `pizzas_has_ingredients` table only stores `pizza_id` and `ingredients_id`. There is no foreign key to the ingredients table because it lives in another service and another database.