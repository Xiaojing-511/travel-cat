/**
 * 把 trips.js 里非 mock 的本地图压成 750 宽 JPEG，输出到 tmp/trips-upload/
 * 并按云存储前缀写回 imageFileID。
 *
 * 用法：node scripts/upload-trip-images.js
 */
const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");
const TRIPS = require("../miniprogram/data/trips.js");
const cloudConfig = require("../miniprogram/config/cloud.js");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "tmp", "trips-upload");
const TRIPS_FILE = path.join(ROOT, "miniprogram", "data", "trips.js");
const WIDTH = 750;
const QUALITY = 80;
const MOCK = "mock.png";

function isLocalTripImage(src) {
  return src && src.indexOf("/images/trips/") === 0 && src.indexOf(MOCK) < 0;
}

function fileIDFor(tripId) {
  const prefix = cloudConfig.tripImagePrefix || "";
  return prefix + tripId + ".jpg";
}

function patchTripsSource(source, updates) {
  return source.replace(/\{\s*\n\s*id:\s*"([^"]+)"[\s\S]*?\n\s*\}/g, (block, id) => {
    const fileID = updates[id];
    if (!fileID) return block;
    if (/imageFileID:/.test(block)) {
      return block.replace(
        /imageFileID:\s*(?:\n\s*)?"[^"]*"/,
        `imageFileID:\n      "${fileID}"`
      );
    }
    return block.replace(
      /(\n)(\s*)(journal:)/,
      `$1$2imageFileID:\n$2      "${fileID}",$1$2$3`
    );
  });
}

async function packTripImages() {
  fs.mkdirSync(OUT, { recursive: true });
  const jobs = TRIPS.filter((trip) => trip && isLocalTripImage(trip.image));
  if (!jobs.length) {
    console.log("没有需要打包的本地旅行图（都是 mock 或已是云地址）。");
    return { packed: [], outDir: OUT };
  }

  const updates = {};
  for (let i = 0; i < jobs.length; i++) {
    const trip = jobs[i];
    const src = path.join(ROOT, "miniprogram", trip.image.replace(/^\//, ""));
    if (!fs.existsSync(src)) {
      console.warn("missing", trip.id, src);
      continue;
    }
    const dest = path.join(OUT, `${trip.id}.jpg`);
    const image = await Jimp.read(src);
    image.resize(WIDTH, Jimp.AUTO);
    image.quality(QUALITY);
    await image.writeAsync(dest);
    const kb = Math.round(fs.statSync(dest).size / 1024);
    const fileID = fileIDFor(trip.id);
    updates[trip.id] = fileID;
    console.log(
      trip.id,
      "->",
      path.relative(ROOT, dest),
      `${kb}kb`,
      fileID
    );
  }

  if (Object.keys(updates).length) {
    const next = patchTripsSource(fs.readFileSync(TRIPS_FILE, "utf8"), updates);
    fs.writeFileSync(TRIPS_FILE, next);
    console.log("updated imageFileID in miniprogram/data/trips.js");
  }

  return { packed: Object.keys(updates), outDir: OUT };
}

module.exports = { packTripImages, fileIDFor };

if (require.main === module) {
  packTripImages().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
