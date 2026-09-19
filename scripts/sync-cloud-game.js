const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DEST = path.join(ROOT, "cloudfunctions", "player");

const COPIES = [
  {
    from: path.join(ROOT, "miniprogram", "utils", "game.js"),
    to: path.join(DEST, "utils", "game.js"),
  },
  {
    from: path.join(ROOT, "miniprogram", "data", "trips.js"),
    to: path.join(DEST, "data", "trips.js"),
  },
];

function syncCloudGame() {
  COPIES.forEach((item) => {
    fs.mkdirSync(path.dirname(item.to), { recursive: true });
    fs.copyFileSync(item.from, item.to);
    console.log(
      "copied",
      path.relative(ROOT, item.from),
      "->",
      path.relative(ROOT, item.to)
    );
  });
}

module.exports = { syncCloudGame };

if (require.main === module) {
  syncCloudGame();
}
