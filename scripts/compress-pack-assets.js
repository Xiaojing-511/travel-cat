/**
 * 把包内超大资源压到可上传体积。
 *
 * 旅行原图留在 miniprogram/images/trips，只靠 packOptions 排除出上传包。
 * BGM 太大，复制到 tmp/audio-upload，需要传到云存储 audio/bgm.mp3。
 *
 * 用法：npm run compress-assets
 */
const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const MINI = path.join(ROOT, "miniprogram");
const IMAGES = path.join(MINI, "images");
const AUDIO = path.join(MINI, "audio");

const IGNORE_FOLDERS = ["pages/example", "components", "images/trips"];
const IGNORE_FILES = [
  "envList.js",
  "images/home-bg.png",
  "images/card-bg.png",
  "audio/bgm.mp3",
];

function kb(file) {
  return Math.round(fs.statSync(file).size / 1024);
}

function logResult(label, dest, extra) {
  console.log(label, path.relative(ROOT, dest), `${kb(dest)}kb`, extra || "");
}

async function toJpeg(src, dest, width, quality) {
  const image = await Jimp.read(src);
  if (image.bitmap.width > width) {
    image.resize(width, Jimp.AUTO);
  }
  image.quality(quality);
  await image.writeAsync(dest);
  logResult("jpeg", dest, `${image.bitmap.width}x${image.bitmap.height}`);
}

async function fitPng(src, dest, maxSide) {
  const tmp = dest + ".tmp.png";
  const meta = await sharp(src).metadata();
  const pipeline = sharp(src);
  if ((meta.width || 0) > maxSide || (meta.height || 0) > maxSide) {
    pipeline.resize(maxSide, maxSide, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }
  await pipeline
    .png({
      compressionLevel: 9,
      palette: true,
      quality: 78,
      effort: 10,
    })
    .toFile(tmp);
  fs.renameSync(tmp, dest);
  const next = await sharp(dest).metadata();
  logResult("png", dest, `${next.width}x${next.height}`);
}

function copyBgmForCloud() {
  const src = path.join(AUDIO, "bgm.mp3");
  if (!fs.existsSync(src)) return;
  const outDir = path.join(ROOT, "tmp", "audio-upload");
  fs.mkdirSync(outDir, { recursive: true });
  const dest = path.join(outDir, "bgm.mp3");
  fs.copyFileSync(src, dest);
  logResult("bgm-cloud", dest, "upload to audio/bgm.mp3");
}

function estimatePack() {
  const files = [];
  const walk = (dir) => {
    fs.readdirSync(dir).forEach((name) => {
      const full = path.join(dir, name);
      const rel = path.relative(MINI, full).split(path.sep).join("/");
      if (name === ".DS_Store") return;
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        if (IGNORE_FOLDERS.indexOf(rel) >= 0) return;
        walk(full);
        return;
      }
      if (IGNORE_FILES.indexOf(rel) >= 0) return;
      files.push({ rel, size: stat.size });
    });
  };
  walk(MINI);
  const total = files.reduce((sum, file) => sum + file.size, 0);
  files.sort((a, b) => b.size - a.size);
  console.log("\npack estimate (after ignore):");
  files.slice(0, 15).forEach((file) => {
    console.log(`  ${Math.round(file.size / 1024)}kb  ${file.rel}`);
  });
  console.log(
    `total ${Math.round(total / 1024)}kb (${(total / 1024 / 1024).toFixed(2)}MB)`
  );
  if (total > 2 * 1024 * 1024) {
    console.warn("still over 2MB main package limit");
  }
}

async function main() {
  await toJpeg(path.join(IMAGES, "home-bg.png"), path.join(IMAGES, "home-bg.jpg"), 750, 78);
  await toJpeg(path.join(IMAGES, "card-bg.png"), path.join(IMAGES, "card-bg.jpg"), 750, 78);
  await toJpeg(
    path.join(IMAGES, "trips", "mock.png"),
    path.join(IMAGES, "trip-mock.jpg"),
    600,
    72
  );

  const pngs = [
    ["cat/eat/001.png", 360],
    ["cat/eat/002.png", 360],
    ["cat/eat/003.png", 360],
    ["cat/sleep/001.png", 360],
    ["cat/sleep/002.png", 360],
    ["cat/sleep/003.png", 360],
    ["cat/stand.png", 360],
    ["cat/stand-bag.png", 360],
    ["cat/lie-1.png", 360],
    ["cat/lie-2.png", 360],
    ["cat/lie-bag.png", 360],
    ["cat/wait-1.png", 360],
    ["cat/wait-2.png", 360],
    ["bowl-food.png", 220],
    ["bowl-food-empty.png", 220],
    ["bowl-water.png", 220],
    ["bowl-water-empty.png", 220],
    ["dialog.png", 320],
  ];
  for (let i = 0; i < pngs.length; i++) {
    const file = path.join(IMAGES, pngs[i][0]);
    if (!fs.existsSync(file)) continue;
    await fitPng(file, file, pngs[i][1]);
  }

  copyBgmForCloud();
  estimatePack();
  console.log("\nBGM 不进代码包。请把 tmp/audio-upload/bgm.mp3 传到云存储目录 audio/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
