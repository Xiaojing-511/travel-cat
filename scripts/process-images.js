const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'images');
const OUT = path.join(ROOT, 'miniprogram', 'images');

function distWhite(r, g, b) {
  return 255 - r + (255 - g) + (255 - b);
}

function floodKnockout(image, maxDist, fromAlpha) {
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  const data = image.bitmap.data;
  const n = w * h;
  const seen = new Uint8Array(n);
  const q = [];

  const tryPush = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (seen[i]) return;
    const o = i * 4;
    if (data[o + 3] === 0 || distWhite(data[o], data[o + 1], data[o + 2]) <= maxDist) {
      seen[i] = 1;
      q.push(i);
    }
  };

  if (fromAlpha) {
    for (let i = 0; i < n; i++) {
      if (data[i * 4 + 3] === 0) {
        seen[i] = 1;
        q.push(i);
      }
    }
  } else {
    for (let x = 0; x < w; x++) {
      tryPush(x, 0);
      tryPush(x, h - 1);
    }
    for (let y = 0; y < h; y++) {
      tryPush(0, y);
      tryPush(w - 1, y);
    }
  }

  let head = 0;
  while (head < q.length) {
    const i = q[head++];
    const o = i * 4;
    data[o + 3] = 0;
    const x = i % w;
    const y = (i / w) | 0;
    tryPush(x + 1, y);
    tryPush(x - 1, y);
    tryPush(x, y + 1);
    tryPush(x, y - 1);
  }
}

function clearTransparentRgb(image) {
  const data = image.bitmap.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] !== 0) continue;
    data[i] = 0;
    data[i + 1] = 0;
    data[i + 2] = 0;
  }
}

function punchPaper(image) {
  const data = image.bitmap.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = (r + g + b) / 3;
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    if (lum >= 193 && sat <= 18) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    }
  }
}

function trimBelowSubject(image) {
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  const data = image.bitmap.data;
  const isCat = (o) => {
    if (data[o + 3] < 16) return false;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const lum = (r + g + b) / 3;
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    return lum < 188 || sat > 16;
  };
  for (let x = 0; x < w; x++) {
    let lowest = -1;
    for (let y = 0; y < h; y++) {
      if (isCat((y * w + x) * 4)) lowest = y;
    }
    if (lowest < 0) continue;
    for (let y = lowest + 1; y < h; y++) {
      const o = (y * w + x) * 4;
      data[o] = 0;
      data[o + 1] = 0;
      data[o + 2] = 0;
      data[o + 3] = 0;
    }
  }
}

function keepLargestOpaque(image, alphaCut) {
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  const data = image.bitmap.data;
  const n = w * h;
  const labels = new Int32Array(n);
  labels.fill(-1);
  const sizes = [];
  let mark = 0;

  for (let i = 0; i < n; i++) {
    if (data[i * 4 + 3] <= alphaCut || labels[i] !== -1) continue;
    const stack = [i];
    labels[i] = mark;
    let size = 0;
    while (stack.length) {
      const p = stack.pop();
      size += 1;
      const x = p % w;
      const y = (p / w) | 0;
      const neigh = [];
      if (x > 0) neigh.push(p - 1);
      if (x + 1 < w) neigh.push(p + 1);
      if (y > 0) neigh.push(p - w);
      if (y + 1 < h) neigh.push(p + w);
      for (let k = 0; k < neigh.length; k++) {
        const nb = neigh[k];
        if (labels[nb] !== -1) continue;
        if (data[nb * 4 + 3] <= alphaCut) continue;
        labels[nb] = mark;
        stack.push(nb);
      }
    }
    sizes[mark] = size;
    mark += 1;
  }

  if (mark === 0) return;
  let best = 0;
  for (let i = 1; i < mark; i++) {
    if (sizes[i] > sizes[best]) best = i;
  }
  for (let i = 0; i < n; i++) {
    if (data[i * 4 + 3] > alphaCut && labels[i] !== best) {
      data[i * 4 + 3] = 0;
    }
  }
}

function alphaBounds(image, cut) {
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  const data = image.bitmap.data;
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > cut) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX) return { x: 0, y: 0, w, h };
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

async function normalizeSleepFrames(dir, canvasW) {
  const width = canvasW || 400;
  const names = ['001.png', '002.png', '003.png'];
  const frames = [];
  for (let i = 0; i < names.length; i++) {
    const image = await Jimp.read(path.join(dir, names[i]));
    frames.push({ name: names[i], image, box: alphaBounds(image, 8) });
  }
  const contentW = width - 16;
  let maxScaledH = 0;
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    frame.scale = contentW / frame.box.w;
    frame.scaledH = Math.round(frame.box.h * frame.scale);
    if (frame.scaledH > maxScaledH) maxScaledH = frame.scaledH;
  }
  const canvasH = maxScaledH + 16;
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const cropped = frame.image.clone().crop(frame.box.x, frame.box.y, frame.box.w, frame.box.h);
    cropped.resize(contentW, frame.scaledH);
    const canvas = new Jimp(width, canvasH, 0x00000000);
    canvas.composite(cropped, 8, canvasH - 8 - frame.scaledH);
    const dest = path.join(dir, frame.name);
    await canvas.writeAsync(dest);
    const stat = fs.statSync(dest);
    console.log(
      'normalize sleep',
      frame.name,
      `${width}x${canvasH}`,
      `${Math.round(stat.size / 1024)}kb`,
    );
  }
}

function cropToAlpha(image, pad) {
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  const data = image.bitmap.data;
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX) return image;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);
  return image.crop(minX, minY, maxX - minX + 1, maxY - minY + 1);
}

async function cutout(src, dest, maxSide) {
  console.log('cutout', path.basename(src));
  const image = await Jimp.read(src);
  image.scaleToFit(maxSide, maxSide);
  floodKnockout(image, 42);
  keepLargestOpaque(image, 16);
  cropToAlpha(image, 8);
  await image.writeAsync(dest);
  const stat = fs.statSync(dest);
  console.log('  ->', path.relative(ROOT, dest), `${image.bitmap.width}x${image.bitmap.height}`, `${Math.round(stat.size / 1024)}kb`);
}

async function cutoutSprite(src, dest, maxSide) {
  console.log('cutout sprite', path.basename(src));
  const image = await Jimp.read(src);
  floodKnockout(image, 56);
  punchPaper(image);
  trimBelowSubject(image);
  keepLargestOpaque(image, 16);
  clearTransparentRgb(image);
  cropToAlpha(image, 8);
  if (image.bitmap.width > maxSide || image.bitmap.height > maxSide) {
    image.scaleToFit(maxSide, maxSide);
  }
  await image.writeAsync(dest);
  const stat = fs.statSync(dest);
  console.log('  ->', path.relative(ROOT, dest), `${image.bitmap.width}x${image.bitmap.height}`, `${Math.round(stat.size / 1024)}kb`);
}

function knockFringe(image, maxDist) {
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  const data = image.bitmap.data;
  const next = Buffer.from(data);
  const isClear = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return true;
    return data[(y * w + x) * 4 + 3] === 0;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      if (data[o + 3] === 0) continue;
      if (distWhite(data[o], data[o + 1], data[o + 2]) > maxDist) continue;
      if (isClear(x - 1, y) || isClear(x + 1, y) || isClear(x, y - 1) || isClear(x, y + 1)) {
        next[o] = 0;
        next[o + 1] = 0;
        next[o + 2] = 0;
        next[o + 3] = 0;
      }
    }
  }
  next.copy(data);
}

function isGroundShadow(o, data) {
  if (data[o + 3] < 16) return false;
  const r = data[o];
  const g = data[o + 1];
  const b = data[o + 2];
  const lum = (r + g + b) / 3;
  const sat = Math.max(r, g, b) - Math.min(r, g, b);
  return lum >= 175 && lum <= 236 && sat >= 6 && sat <= 18;
}

function inkBounds(image) {
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  const data = image.bitmap.data;
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      const r = data[o];
      const g = data[o + 1];
      const b = data[o + 2];
      const lum = (r + g + b) / 3;
      const sat = Math.max(r, g, b) - Math.min(r, g, b);
      if (lum < 200 || sat > 20) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX) return { x: 0, y: 0, w, h };
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function fillGroundShadow(image) {
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  const data = image.bitmap.data;
  const box = inkBounds(image);
  const yMin = box.y + Math.floor(box.h * 0.73);
  const seen = new Uint8Array(w * h);
  const q = [];

  const tryPush = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h || y < yMin) return;
    const i = y * w + x;
    if (seen[i] || !isGroundShadow(i * 4, data)) return;
    seen[i] = 1;
    q.push(i);
  };

  const seedRows = [0.81, 0.9, 0.97];
  for (let r = 0; r < seedRows.length; r++) {
    const y = box.y + Math.floor(box.h * seedRows[r]);
    if (y < 0 || y >= h) continue;
    for (let x = box.x; x < box.x + box.w; x++) {
      const t = (x - box.x) / box.w;
      if (t > 0.22 && t < 0.78 && seedRows[r] < 0.94) continue;
      tryPush(x, y);
    }
  }

  let head = 0;
  while (head < q.length) {
    const i = q[head++];
    const o = i * 4;
    data[o] = 0;
    data[o + 1] = 0;
    data[o + 2] = 0;
    data[o + 3] = 0;
    const x = i % w;
    const y = (i / w) | 0;
    tryPush(x + 1, y);
    tryPush(x - 1, y);
    tryPush(x, y + 1);
    tryPush(x, y - 1);
  }
}

async function cutoutEat(src, dest, maxSide) {
  console.log('cutout eat', path.basename(src));
  const image = await Jimp.read(src);
  fillGroundShadow(image);
  floodKnockout(image, 52);
  keepLargestOpaque(image, 16);
  trimBelowSubject(image);
  knockFringe(image, 28);
  keepLargestOpaque(image, 16);
  clearTransparentRgb(image);
  cropToAlpha(image, 12);
  if (image.bitmap.width > maxSide || image.bitmap.height > maxSide) {
    image.scaleToFit(maxSide, maxSide);
  }
  await image.writeAsync(dest);
  const stat = fs.statSync(dest);
  console.log('  ->', path.relative(ROOT, dest), `${image.bitmap.width}x${image.bitmap.height}`, `${Math.round(stat.size / 1024)}kb`);
}

async function jpeg(src, dest, width, quality) {
  console.log('jpeg', path.basename(src));
  const image = await Jimp.read(src);
  image.resize(width, Jimp.AUTO);
  image.quality(quality);
  await image.writeAsync(dest);
  const stat = fs.statSync(dest);
  console.log('  ->', path.relative(ROOT, dest), `${image.bitmap.width}x${image.bitmap.height}`, `${Math.round(stat.size / 1024)}kb`);
}

async function main() {
  fs.mkdirSync(path.join(OUT, 'cat'), { recursive: true });

  await jpeg(path.join(SRC, '背景.png'), path.join(OUT, 'home-bg.jpg'), 750, 78);
  await jpeg(path.join(SRC, '卡片', '背景.png'), path.join(OUT, 'card-bg.jpg'), 750, 78);

  await cutout(path.join(SRC, '食盆.jpeg'), path.join(OUT, 'bowl-food.png'), 420);
  await cutout(path.join(SRC, '食盆-空.jpeg'), path.join(OUT, 'bowl-food-empty.png'), 420);
  await cutout(path.join(SRC, '水盆.jpeg'), path.join(OUT, 'bowl-water.png'), 420);
  await cutout(path.join(SRC, '水盆-空.jpeg'), path.join(OUT, 'bowl-water-empty.png'), 420);

  const cats = [
    ['站立.png', 'stand.png'],
    ['站立-有书包.jpeg', 'stand-bag.png'],
    ['趴下-可选1.png', 'lie-1.png'],
    ['趴下-可选2.jpeg', 'lie-2.png'],
    ['趴下-有书包.jpeg', 'lie-bag.png'],
    ['背对等待-可选1.jpeg', 'wait-1.png'],
    ['背对等待-可选2.png', 'wait-2.png'],
  ];
  for (const [from, to] of cats) {
    await cutout(path.join(SRC, '猫咪', from), path.join(OUT, 'cat', to), 400);
  }

  fs.mkdirSync(path.join(OUT, 'cat', 'sleep'), { recursive: true });
  const sleeps = [
    ['睡觉.png', '001.png'],
    ['睡觉-002.png', '002.png'],
    ['睡觉-003.png', '003.png'],
  ];
  for (const [from, to] of sleeps) {
    await cutout(path.join(SRC, '猫咪', from), path.join(OUT, 'cat', 'sleep', to), 400);
  }
  await normalizeSleepFrames(path.join(OUT, 'cat', 'sleep'), 400);
}

async function run() {
  if (process.argv[2] === 'sleep') {
    await normalizeSleepFrames(path.join(OUT, 'cat', 'sleep'), 400);
    return;
  }
  if (process.argv[2] === 'eat') {
    await cutoutEat(
      path.join(SRC, '猫咪', 'eat1.png'),
      path.join(OUT, 'cat', 'eat.png'),
      400,
    );
    return;
  }
  await main();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
