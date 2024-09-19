const express = require("express");
const path = require("path");
const router = express.Router();
const { checkSchema, validationResult } = require("express-validator");

const Post = require(path.join(__dirname, "../models/post.js"));
const Comment = require(path.join(__dirname, "../models/comment.js"));

const ArrayOfDatesOrDate = (value) => {
  if (value instanceof Array) {
    if (value.length > 2) return false;
    return value.every((e) => isValidDate(new Date(e)));
  } else if (isValidDate(new Date(value))) {
    return true;
  }
  return false;
};

const ArrayOfInt = (value) =>
  value instanceof Array &&
  value.every((e) => !isNaN(parseInt(e)) && parseInt(e) > 0);

const isValidDate = (d) => d instanceof Date && !isNaN(d);

router.get("/post/get/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  const id = parseInt(req.params.id);

  if (isNaN(id) || id <= 0) {
    return res.status(400).send({ error: `Id must be a number and > 0` });
  }
  const __post = await Post.findOne({ id: id });

  if (!__post) return res.status(404).send({ error: `Post ${id} not found` });

  return res.send(__post);
});

router.get("/comment/get/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  const id = parseInt(req.params.id);

  if (isNaN(id) || id <= 0) {
    return res.status(400).send({ error: `Id must be a number and > 0` });
  }
  const __comment = await Comment.findOne({ id: id });

  if (!__comment)
    return res.status(404).send({ error: `Comment ${id} not found` });

  return res.send(__comment);
});

router.get(
  "/comment/search",
  checkSchema({
    plaintext: { optional: true, isString: true, trim: true },
    author: { optional: true, isInt: true },
    user: { optional: true, isInt: true },
    created: { optional: true, custom: { options: ArrayOfDatesOrDate } },
    page: { optional: true, isInt: true },
  }),
  async (req, res) => {
    res.setHeader("Content-Type", "application/json");

    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.send({ error: result.array() });
    }

    const page = req.query.page || 1;
    const limit = 50;

    const filter = {};

    if (req.query.plaintext) {
      filter["$text"] = { $search: req.query.plaintext };
    }
    if (req.query.author) {
      filter["author"] = parseInt(req.query.author);
    }
    if (req.query.user) {
      filter["user"] = parseInt(req.query.user);
    }
    if (req.query.created) {
      if (req.query.created instanceof Array) {
        filter["created"] = {};
        if (req.query.created[0]) {
          filter["created"]["$gte"] = new Date(req.query.created[0]);
        }
        if (req.query.created[1]) {
          filter["created"]["$lte"] = new Date(req.query.created[1]);
        }
      } else filter["created"] = new Date(req.query.created);
    }

    const comments = await Comment.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ id: -1 });

    const count = await Comment.countDocuments(filter);

    return res.send({
      comments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  }
);

router.get(
  "/post/search",
  checkSchema({
    plaintext: { optional: true, isString: true, trim: true },
    users: { optional: true, custom: { options: ArrayOfInt } },
    created: { optional: true, custom: { options: ArrayOfDatesOrDate } },
    page: { optional: true, isInt: true },
  }),
  async (req, res) => {
    res.setHeader("Content-Type", "application/json");

    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.send({ error: result.array() });
    }

    const page = req.query.page || 1;
    const limit = 10;

    const filter = {};

    if (req.query.plaintext) {
      filter["$text"] = { $search: req.query.plaintext };
    }
    if (req.query.users) {
      filter["usersInText"] = { $in: req.query.users.map((e) => parseInt(e)) };
    }
    if (req.query.created) {
      if (req.query.created instanceof Array) {
        filter["created"] = {};
        if (req.query.created[0]) {
          filter["created"]["$gte"] = new Date(req.query.created[0]);
        }
        if (req.query.created[1]) {
          filter["created"]["$lte"] = new Date(req.query.created[1]);
        }
      } else filter["created"] = new Date(req.query.created);
    }

    const posts = await Post.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ id: -1 });

    const count = await Post.countDocuments(filter);

    return res.send({
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  }
);

module.exports = router;
