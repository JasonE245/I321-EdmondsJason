# Pizzas API

A simple RESTful API to manage the pizza menu (CRUD) built with **Express**, **SQLite3**, **express-validator**, and documented with **Swagger UI**.

---

## Requirements

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

---

## Project structure

```
│   .env
│   .gitignore
│   dev.sqlite
│   package-lock.json
│   package.json
│   README.md
│
├───docs
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
    └───routes
            pizzas.js
            router.js
```

## Installation

```bash
npm install
```

## Development

Start the server in dev mode (with auto-reload via nodemon):

```bash
npm run dev
```

Start the server normally:

```bash
npm start
```

## Usage

API base URL: http://localhost:3000/api

Swagger UI docs: http://localhost:3000/docs

## Environment

The .env file defines:

```bash
PORT=3000
DB_FILE=./dev.sqlite
NODE_ENV=development
```