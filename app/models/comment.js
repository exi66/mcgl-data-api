const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const path = require("path");
const dbConfig = require(path.join(__dirname, "../config/db.config.js"));

mongoose.connect(dbConfig.url);

const CommentSchema = new Schema(
  {
    id: {
      type: Number,
      unique: true,
      require: true,
    },
    created: Date,
    plaintext: String,
    user: Number,
    author: Number,
  },
  {
    toJSON: {
      transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

CommentSchema.index({ plaintext: "text" });

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
