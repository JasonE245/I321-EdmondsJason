require("dotenv").config();
var express = require("express");
var cors = require("cors");
var path = require("path");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var errorHandler = require("./middleware/errorHandler");

var app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/api/users", usersRouter);

app.use(errorHandler);

module.exports = app;