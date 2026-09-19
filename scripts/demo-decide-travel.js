#!/usr/bin/env node
/**
 * 场景 2：日常轮换抽到 decide（要出门吗...），到期后真正出门。
 *
 * 用法：
 *   node scripts/demo-decide-travel.js
 *   node scripts/demo-decide-travel.js --stay
 *   node scripts/demo-decide-travel.js --low
 *   node scripts/demo-decide-travel.js --high
 *
 * 默认：粮水各 10g（中档），强制 1/3 出门命中，犹豫到期后进入旅行。
 * --stay：强制 2/3 放弃出门，再抽下一个日常动作。
 * --low / --high：出发物资分档（低档耗尽剩余；高档需粮水都 ≥ 20g）。
 *
 * 微信开发者工具：把文末 Console 粘贴进去后重新进入首页。
 * 门口会显示「要出门吗...」约 12~25 秒；本脚本种子把剩余时间压到约 8 秒，
 * 并写入 debugForceTravel，到期必出门（需当前 game.js 识别该字段；
 * 若未识别，约 1/3 概率出门，可重复粘贴再进）。
 */

const game = require("../miniprogram/utils/game.js");

const stay = process.argv.indexOf("--stay") >= 0;
const low = process.argv.indexOf("--low") >= 0;
const high = process.argv.indexOf("--high") >= 0;

function far(state, from) {
  const t = from + 30 * game.DAY_MS;
  return {
    ...state,
    nextDrinkCheckAt: t,
    nextEatCheckAt: t,
    nextTravelCheckAt: t,
    nextIdleArtAt: t,
  };
}

function screen(title, state, now, extra) {
  const vm = game.viewModel(state, now);
  console.log("");
  console.log("======== " + title + " ========");
  console.log("status        :", state.status);
  console.log("activity      :", state.activity);
  console.log("statusText    :", vm.statusText);
  console.log("catPlace      :", vm.catPlace || "(旅行中不展示猫)");
  console.log("catSrc        :", vm.catSrc || "(无)");
  console.log("粮 / 水       :", vm.food + "g / " + vm.water + "g");
  console.log("剩余          :", vm.statusRemainText);
  if (vm.traveling) {
    console.log("出门文案      :", "它出门了  " + vm.awayText);
    console.log("旅行倒计时    :", vm.remainText);
  }
  if (extra && extra.note) console.log("说明          :", extra.note);
}

function stock() {
  if (low) return { food: 6, water: 4, emptySince: 0 };
  if (high) return { food: 30, water: 30, emptySince: 0 };
  return { food: 10, water: 10, emptySince: 0 };
}

const now = Date.now();
const decideMs = 8 * 1000;
let state = far(game.applyActivity(game.createState(now), "decide", now, decideMs), now);
state = { ...state, ...stock() };

console.log("场景：在家抽到 decide，门口犹豫，到期后判定是否出门。");
console.log(
  "物资：",
  low ? "低档（<10g）" : high ? "高档（≥20g）" : "中档（≥10g）",
  " 判定：",
  stay ? "强制放弃出门" : "强制出门"
);

screen("犹豫中（要出门吗...）", state, now, {
  note: "门口背影，文案「要出门吗...」，时长本应 12~25 秒，演示压成 8 秒。",
});

if (stay) {
  game.setRandom(() => 0.5);
} else {
  game.setRandom(() => 0);
}

const due = state.activityEndAt;
const result = game.tick(state, due, undefined, { enteringApp: false });

if (stay) {
  screen("犹豫结束 · 放弃出门", result.state, due, {
    note: "2/3 放弃：不会立刻再抽到 decide，进入睡觉 / 发呆 / 等饭等下一个动作。",
  });
  if (result.state.status === "traveling") {
    console.error("\n失败：--stay 却出门了。");
    process.exit(1);
  }
  if (result.state.activity === "decide") {
    console.error("\n失败：放弃后仍停在 decide。");
    process.exit(1);
  }
} else {
  screen("犹豫结束 · 出发旅行", result.state, due, {
    note: "1/3 出门：猫从图上消失，显示「它出门了」和已出门分钟、倒计时。",
  });
  if (result.state.status !== "traveling") {
    console.error("\n失败：没有进入 traveling。当前 activity =", result.state.activity);
    process.exit(1);
  }

  const later = due + game.MINUTE_MS;
  screen("出门 1 分钟后", result.state, later, {
    note: "已出门分钟向下取整；倒计时继续走。",
  });
}

game.setRandom();

const supplies = stock();
console.log("\n-------- 微信开发者工具 Console 粘贴（时间在粘贴时重算） --------");
console.log(`(function () {
  var now = Date.now();
  var day = 24 * 60 * 60 * 1000;
  var state = ${JSON.stringify({
    food: supplies.food,
    water: supplies.water,
    emptySince: 0,
    status: "home",
    travelEndAt: 0,
    travelStartedAt: 0,
    lastTravelAt: 0,
    hasUnreadCard: false,
    collectedCards: [],
    activity: "decide",
    poseVariant: 1,
    idleKind: "lie",
    idleArt: 0,
    debugForceTravel: !stay,
    debugForceStay: stay,
  })};
  state.createdAt = now;
  state.activityEndAt = now + 8 * 1000;
  state.nextDrinkCheckAt = now + 30 * day;
  state.nextEatCheckAt = now + 30 * day;
  state.nextTravelCheckAt = now + 30 * day;
  state.nextIdleArtAt = now + 30 * day;
  wx.setStorageSync('travel_cat_state_v1', state);
  wx.setStorageSync('travel_cat_has_left', 1);
  console.log(${stay
    ? "'已写入 decide 存档（强制放弃出门）。重新进入首页，约 8 秒后应离开门口，不应旅行。'"
    : "'已写入 decide 存档（强制出门）。重新进入首页，约 8 秒后应变「它出门了」。'"});
})();`);
console.log("-------------------------------------------");
