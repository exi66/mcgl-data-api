const fs = require("fs-extra");
const path = require("path");
const { parse } = require("date-fns");
const cliProgress = require("cli-progress");

const Comment = require(path.join(__dirname, "../models/comment.js"));

module.exports = async function () {
  const __progress = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );

  await run(__progress);

  __progress.stop();
  console.log("All comments have been processed!");
};

async function run(__progress) {
  console.log("Read comments.json file...");

  if (!fs.existsSync(path.join(__dirname, "../.temp/comments.json"))) {
    console.log(
      "comments.json not found! Run 'php ./utils/convert_comments_to_json.php' to generate it."
    );
    return;
  }

  const comments = require(path.join(__dirname, "../.temp/comments.json"));
  comments.sort((a, b) => parseInt(a.id) - parseInt(b.id));

  console.log(`Found ${comments.length} comments. Start seeding...`);
  __progress.start(comments.length, 0);

  for (const c of comments) {
    const id = parseInt(c.id);
    const author = parseInt(c.mod_id);
    const user = parseInt(c.user_id);
    const plaintext = c.info;
    const created = parse(c.time, "yyyy-MM-dd HH:mm:ss", new Date());

    const isAlreadyExists = await Comment.exists({ id: id });
    if (!isAlreadyExists) {
      const __comment = new Comment({
        id: id,
        created: created,
        plaintext: plaintext,
        author: author,
        user: user,
      });
      await __comment.save();
    }
    __progress.increment();
  }
}
