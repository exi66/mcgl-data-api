const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 1000,
  limit: 2,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests! Only two per second allowed!" },
});

const apiRouter = require(path.join(__dirname, "/routes/api"));

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(limiter);
app.use("/", apiRouter);

module.exports = app;
