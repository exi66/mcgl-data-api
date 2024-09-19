const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const path = require("path");
const dbConfig = require(path.join(__dirname, "../config/db.config.js"));

mongoose.connect(dbConfig.url);

const PostSchema = new Schema(
  {
    id: {
      type: Number,
      unique: true,
      require: true,
    },
    created: Date,
    plaintext: String,
    usersInText: [Number],
    linksInText: [String],
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

PostSchema.index({ plaintext: "text", linksInText: "text" });

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
