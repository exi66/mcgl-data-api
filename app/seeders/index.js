const startBackscans2 = require("./backscan2.js");
const startComments = require("./comments.js");

startComments().then(() => startBackscans2());
