const fs = require("fs");
const archiver = require("archiver");

const now = new Date();

const output = fs.createWriteStream(
  __dirname + `/bin/UQCalendar-${new Date().toJSON()}.zip`
);
const archive = archiver("zip", {
  zlib: { level: 9 }
});

archive.on("error", function(err) {
  throw err;
});

archive.pipe(output);

archive.file(__dirname + "/manifest.json", { name: "manifest.json" });

archive.directory(__dirname + "/dist", "dist");
archive.directory(__dirname + "/assets", "assets");

archive.finalize();
