const fs = require("fs-extra");
const path = require("path");
const { parse } = require("date-fns");
const cliProgress = require("cli-progress");
const JSZip = require("jszip");

const Post = require(path.join(__dirname, "../models/post.js"));
const backscan2 = path.join(__dirname, "../.source/backscan2.zip");

module.exports = async function () {
  const __progress = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );

  await run(__progress);

  __progress.stop();
  console.log("All files have been processed!");
};

async function run(__progress) {
  console.log("Read backscan2 zip...");

  const zipFile = fs.readFileSync(backscan2);
  const zip = await JSZip.loadAsync(zipFile);

  const filesList = Object.keys(zip.files).filter((e) => e.endsWith(".html"));

  console.log(`Found ${filesList.length} files. Start seeding...`);
  __progress.start(filesList.length, 0);

  for (const filename of filesList) {
    const id = parseInt(filename.replace("backscan2/", "").replace(/\D/g, ""));

    const __fileString = await zip.file(filename).async("string");
    const __dateString = __fileString
      .split("<")[0]
      .replace("ВРЕМЯ РЕДАКТИРОВАНИЯ :", "")
      .trim();
    const created = parse(__dateString, "yyyy-MM-dd HH:mm:ss", new Date());
    const html = __fileString.replace(
      "ВРЕМЯ РЕДАКТИРОВАНИЯ : " + __dateString,
      ""
    );

    /**
     * @source https://regex101.com/r/3fYy3x/1
     */
    const urlRegex =
      /(?:http[s]?:\/\/.)?(?:www\.)?[-a-zA-Z0-9@%._\+~#=]{2,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/gm;
    const __linksList = html.match(urlRegex) || [];
    const links = __linksList.filter(
      (link) => !link.includes("forum.minecraft-galaxy.ru/img/")
    );

    const __usersLinks = links.filter((link) =>
      link.includes("forum.minecraft-galaxy.ru/profilemain/")
    );
    const users = __usersLinks
      .map((e) => parseInt(e.replace(/\D/g, "")))
      .filter((e) => !isNaN(e) && e > 0);

    const plaintext = html
      .replace(/<br\s*\/?>/gm, "\n")
      .replace(/<[^>]*>?/gm, "")
      .trim();

    const isAlreadyExists = await Post.exists({ id: id });
    if (!isAlreadyExists) {
      const __post = new Post({
        id: id,
        created: created,
        plaintext: plaintext,
        usersInText: users,
        linksInText: links.filter(
          (link) => !link.includes("forum.minecraft-galaxy.ru/profilemain/")
        ),
      });
      await __post.save();
    }
    __progress.increment();
  }
}
