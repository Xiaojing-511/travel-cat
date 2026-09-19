/**
 * 改完代码后跑这一条：
 *   npm run after-edit
 *
 * 1. 跑游戏规则测试
 * 2. 打包旅行图到 tmp/trips-upload，并写回 trips.js 的 imageFileID
 * 3. 把 game.js / trips.js 拷进云函数目录
 *
 * 之后仍需在开发者工具里：上传 tmp/trips-upload（有新图时）、部署云函数 player、编译小程序。
 */
const { spawnSync } = require("child_process");
const path = require("path");
const { packTripImages } = require("./upload-trip-images.js");
const { syncCloudGame } = require("./sync-cloud-game.js");

const ROOT = path.join(__dirname, "..");

function runNode(rel, extraArgs) {
  const file = path.join(ROOT, rel);
  const args = [file].concat(extraArgs || []);
  console.log("\n>>", "node", rel, (extraArgs || []).join(" "));
  const result = spawnSync(process.execPath, args, {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (result.status) {
    process.exit(result.status);
  }
}

async function main() {
  const skipTest = process.argv.indexOf("--skip-test") >= 0;

  console.log("after-edit: 测试 → 打包旅行图 → 同步云函数代码");

  if (!skipTest) {
    runNode("scripts/test-game.js");
  } else {
    console.log("\n>> skip tests");
  }

  console.log("\n>> pack trip images");
  const packed = await packTripImages();

  console.log("\n>> sync cloud function copies");
  syncCloudGame();

  console.log("\n完成。接下来在微信开发者工具里：");
  let step = 1;
  if (packed.packed && packed.packed.length) {
    console.log(
      `${step}. 云存储：把`,
      path.relative(ROOT, packed.outDir),
      "上传到目录 trips-upload/（覆盖同名 jpg）"
    );
    step += 1;
  }
  const bgmUpload = path.join(ROOT, "tmp", "audio-upload", "bgm.mp3");
  if (require("fs").existsSync(bgmUpload)) {
    console.log(
      `${step}. 云存储：把 tmp/audio-upload/bgm.mp3 传到目录 audio/（文件名保持 bgm.mp3）`
    );
    step += 1;
  }
  console.log(`${step}. 右键 cloudfunctions/player → 上传并部署：云端安装依赖`);
  console.log(`${step + 1}. 编译 / 上传小程序`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
