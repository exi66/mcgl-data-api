const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const apiRouter = require(path.join(__dirname, "/routes/api"));
const indexRouter = require(path.join(__dirname, "/routes/index"));

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/v1/", apiRouter);

module.exports = app;
