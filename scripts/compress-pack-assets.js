/**
 * 把包内超大资源压到可上传体积。主包上限 2MB。
 *
 * 家里和阳台的不透明背景走 JPEG。花盆和明信片底图带透明，压成调色板 PNG。
 * 旅行原图留在 miniprogram/images/trips，只靠 packOptions 排除出上传包。
 * BGM 走云存储，不进代码包。
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

const IGNORE_FOLDERS = [];
const IGNORE_FILES = [];

function kb(file) {
  return Math.round(fs.statSync(file).size / 1024);
}

function logResult(label, dest, extra) {
  console.log(label, path.relative(ROOT, dest), `${kb(dest)}kb`, extra || "");
}

async function toJpeg(src, dest, width, quality) {
  if (!fs.existsSync(src) || typeof dest !== "string") return;
  const image = await Jimp.read(src);
  if (image.bitmap.width > width) {
    image.resize(width, Jimp.AUTO);
  }
  image.quality(quality);
  await image.writeAsync(dest);
  logResult("jpeg", dest, `${image.bitmap.width}x${image.bitmap.height}`);
}

async function fitPng(src, dest, maxSide, quality) {
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
      quality: quality == null ? 78 : quality,
      effort: 10,
    })
    .toFile(tmp);
  fs.renameSync(tmp, dest);
  const next = await sharp(dest).metadata();
  logResult(
    "png",
    dest,
    `${next.width}x${next.height} q${quality == null ? 78 : quality}`,
  );
}

async function shrinkJpeg(file, maxWidth, quality, maxBytes) {
  if (!fs.existsSync(file)) return;
  let q = quality;
  for (let attempt = 0; attempt < 6; attempt++) {
    const meta = await sharp(file).metadata();
    const size = fs.statSync(file).size;
    if ((meta.width || 0) <= maxWidth && size <= maxBytes) return;
    const tmp = file + ".tmp.jpg";
    await sharp(file)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .jpeg({ quality: q, mozjpeg: true })
      .toFile(tmp);
    fs.renameSync(tmp, file);
    const next = await sharp(file).metadata();
    logResult("jpeg", file, `${next.width}x${next.height} q${q}`);
    if (fs.statSync(file).size <= maxBytes) return;
    q = Math.max(52, q - 8);
  }
}

async function opaquePngToJpeg(srcPng, destJpg, maxWidth, quality, maxBytes) {
  if (!fs.existsSync(srcPng)) {
    await shrinkJpeg(destJpg, maxWidth, quality, maxBytes);
    return;
  }
  const tmp = destJpg + ".tmp.jpg";
  await sharp(srcPng)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toFile(tmp);
  fs.renameSync(tmp, destJpg);
  if (path.resolve(srcPng) !== path.resolve(destJpg)) fs.unlinkSync(srcPng);
  const next = await sharp(destJpg).metadata();
  logResult("jpeg", destJpg, `${next.width}x${next.height}`);
  await shrinkJpeg(destJpg, maxWidth, quality, maxBytes);
}

async function fitTransparentPng(src, dest, opts) {
  if (!fs.existsSync(src)) return;
  const maxWidth = opts.maxWidth || 4096;
  const maxHeight = opts.maxHeight || 4096;
  const maxBytes = opts.maxBytes == null ? Infinity : opts.maxBytes;
  let quality = opts.quality || 80;
  const same = path.resolve(src) === path.resolve(dest);
  let input = src;

  for (let attempt = 0; attempt < 6; attempt++) {
    const meta = await sharp(input).metadata();
    const size = fs.statSync(input).size;
    const sized =
      (meta.width || 0) <= maxWidth && (meta.height || 0) <= maxHeight;
    if (meta.format === "png" && sized && size <= maxBytes && (same || input === dest)) {
      return;
    }
    const tmp = dest + ".tmp.png";
    const pipeline = sharp(input);
    if (!sized) {
      pipeline.resize(maxWidth, maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }
    await pipeline
      .png({
        compressionLevel: 9,
        palette: true,
        quality,
        effort: 10,
      })
      .toFile(tmp);
    fs.renameSync(tmp, dest);
    if (!same && input === src && fs.existsSync(src)) fs.unlinkSync(src);
    const next = await sharp(dest).metadata();
    logResult("png", dest, `${next.width}x${next.height} q${quality}`);
    if (fs.statSync(dest).size <= maxBytes) return;
    quality = Math.max(40, quality - 10);
    input = dest;
  }
}

const POSE_RE = /^(stand|wait)\.png$/i;
const FRAME_DIRS = {
  sleep: /^00[123]\.png$/i,
  eat: /^00[12]\.png$/i,
  idle: /^00[12]\.png$/i,
};

function breedSpriteDirs() {
  return fs
    .readdirSync(IMAGES)
    .filter((name) => name === "cat" || name.indexOf("cat-") === 0)
    .map((name) => path.join(IMAGES, name))
    .filter((dir) => fs.statSync(dir).isDirectory());
}

function collectBreedSprites() {
  const files = [];
  breedSpriteDirs().forEach((dir) => {
    fs.readdirSync(dir).forEach((name) => {
      const full = path.join(dir, name);
      const frameRe = FRAME_DIRS[name];
      if (frameRe && fs.statSync(full).isDirectory()) {
        fs.readdirSync(full).forEach((frame) => {
          if (frameRe.test(frame)) files.push(path.join(full, frame));
        });
        return;
      }
      if (POSE_RE.test(name)) files.push(full);
    });
  });
  return files;
}

async function fitSprite(file, maxSide, maxBytes) {
  const limit = maxBytes == null ? 200 * 1024 : maxBytes;
  let side = maxSide;
  let quality = 80;
  for (let attempt = 0; attempt < 8; attempt++) {
    const meta = await sharp(file).metadata();
    const size = fs.statSync(file).size;
    if (
      (meta.width || 0) <= side &&
      (meta.height || 0) <= side &&
      size <= limit
    ) {
      return;
    }
    await fitPng(file, file, side, quality);
    if (fs.statSync(file).size <= limit) return;
    if (quality > 52) quality -= 10;
    else side = Math.max(180, Math.round(side * 0.85));
  }
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
    `total ${Math.round(total / 1024)}kb (${(total / 1024 / 1024).toFixed(2)}MB)`,
  );
  if (total > 2 * 1024 * 1024) {
    console.warn("still over 2MB main package limit");
    process.exitCode = 1;
  }
}

async function main() {
  await opaquePngToJpeg(
    path.join(IMAGES, "home-bg.png"),
    path.join(IMAGES, "home-bg.jpg"),
    750,
    72,
    120 * 1024,
  );
  const cardPng = path.join(IMAGES, "card-bg.png");
  const cardWebp = path.join(IMAGES, "card-bg.webp");
  const cardOpts = {
    maxWidth: 900,
    maxHeight: 1600,
    quality: 64,
    maxBytes: 110 * 1024,
  };
  if (fs.existsSync(cardWebp))
    await fitTransparentPng(cardWebp, cardPng, cardOpts);
  if (fs.existsSync(cardPng))
    await fitTransparentPng(cardPng, cardPng, cardOpts);

  const balcony = path.join(IMAGES, "balcony");
  const bgPng = path.join(balcony, "bg.png");
  const bgJpg = path.join(balcony, "bg.jpg");
  if (fs.existsSync(bgPng)) {
    const tmp = bgJpg + ".tmp.jpg";
    await sharp(bgPng)
      .resize({ width: 750, withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(tmp);
    fs.renameSync(tmp, bgJpg);
    fs.unlinkSync(bgPng);
    const next = await sharp(bgJpg).metadata();
    logResult("jpeg", bgJpg, `${next.width}x${next.height}`);
  }
  await shrinkJpeg(bgJpg, 750, 78, 120 * 1024);
  await shrinkJpeg(path.join(balcony, "left.jpg"), 320, 72, 24 * 1024);
  await shrinkJpeg(path.join(balcony, "right.jpg"), 320, 72, 24 * 1024);

  const planterDir = path.join(balcony, "planter");
  if (fs.existsSync(planterDir)) {
    // 四张生长阶段共用同一画布，花盆锚在同一像素。只压体积，不要单独改尺寸。
    const planterOpts = {
      maxWidth: 800,
      maxHeight: 720,
      quality: 68,
      maxBytes: 90 * 1024,
    };
    const names = fs.readdirSync(planterDir);
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      if (!/\.webp$/i.test(name)) continue;
      const file = path.join(planterDir, name);
      await fitTransparentPng(
        file,
        file.replace(/\.webp$/i, ".png"),
        planterOpts,
      );
    }
    const pngs = fs.readdirSync(planterDir);
    for (let i = 0; i < pngs.length; i++) {
      if (!/\.png$/i.test(pngs[i])) continue;
      const file = path.join(planterDir, pngs[i]);
      await fitTransparentPng(file, file, planterOpts);
    }
  }
  const leaf = path.join(balcony, "leaf.png");
  const leafGold = path.join(balcony, "leaf-gold.png");
  if (fs.existsSync(leaf)) await fitSprite(leaf, 256, 20 * 1024);
  if (fs.existsSync(leafGold)) await fitSprite(leafGold, 256, 20 * 1024);

  await toJpeg(
    path.join(IMAGES, "trips", "mock.png"),
    path.join(IMAGES, "trip-mock.jpg"),
    600,
    72,
  );

  const sprites = collectBreedSprites();
  for (let i = 0; i < sprites.length; i++) {
    await fitSprite(sprites[i], 360, 28 * 1024);
  }

  const pngs = [
    ["bag.png", 220, 20 * 1024],
    ["dialog.png", 320, 16 * 1024],
    ["service.png", 160, 20 * 1024],
    ["sound-on.png", 128, 16 * 1024],
    ["sound-off.png", 128, 16 * 1024],
    ["cat-id.png", 160, 12 * 1024],
  ];
  ["food", "water"].forEach((dirName) => {
    const dir = path.join(IMAGES, dirName);
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach((name) => {
      if (!/\.png$/i.test(name)) return;
      pngs.push([dirName + "/" + name, 240, 14 * 1024]);
    });
  });
  for (let i = 0; i < pngs.length; i++) {
    const file = path.join(IMAGES, pngs[i][0]);
    if (!fs.existsSync(file)) continue;
    await fitSprite(file, pngs[i][1], pngs[i][2]);
  }

  estimatePack();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
