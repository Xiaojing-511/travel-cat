#!/usr/bin/env node
/**
 * 场景 1：猫咪「在等你」时，玩家回到小程序。
 *
 * 用法：
 *   node scripts/demo-welcome-back.js
 *   node scripts/demo-welcome-back.js --hungry
 *
 * --hungry：粮水都为 0，且空碗已超过 3 小时 → 对话框 10 秒后切到「等饭中...」
 * 默认：碗里有粮水 → 对话框 10 秒后切到「发呆中...」
 *
 * 微信开发者工具里看真画面：把文末 wx.setStorageSync 整段贴进 Console，
 * 然后切到后台再点回来（或重新编译）。不要只从相册页返回，那不算「进入小程序」。
 */

const game = require("../miniprogram/utils/game.js");

const hungry = process.argv.indexOf("--hungry") >= 0;

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
  console.log("activity      :", state.activity);
  console.log("statusText    :", vm.statusText);
  console.log("catPlace      :", vm.catPlace);
  console.log("catSrc        :", vm.catSrc);
  console.log("粮 / 水       :", vm.food + "g / " + vm.water + "g");
  console.log("剩余          :", vm.statusRemainText);
  console.log("弹窗「你回来了」:", extra && extra.welcomeBack ? "是" : "否");
  if (extra && extra.note) console.log("说明          :", extra.note);
}

const now = Date.now();
let state = far(game.applyActivity(game.createState(now), "wait", now, 2 * game.HOUR_MS), now);

if (hungry) {
  state = {
    ...state,
    food: 0,
    water: 0,
    emptySince: now - game.EMPTY_HUNGRY_MS - 60 * 1000,
  };
} else {
  state = { ...state, food: 20, water: 20, emptySince: 0 };
}

console.log("场景：玩家离开后再打开小程序，猫咪仍在门口「在等你」。");
console.log("分支：", hungry ? "空碗 > 3 小时 → 等饭" : "碗非空 → 发呆");

screen("离开期间（玩家不在）", state, now, {
  welcomeBack: false,
  note: "门口背影，文案「在等你~」。在线日常轮换不会抽到 wait，这是离线追赶才会出现的状态。",
});

const result = game.tick(state, now, undefined, { enteringApp: true });

screen("玩家刚回来（10 秒内）", result.state, now, {
  welcomeBack: result.welcomeBack,
  note: "仍停在门口「在等你~」，同时弹出「你回来了」，维持 10 秒。点对话框只会关掉文案，不会立刻换状态。",
});

if (!result.welcomeBack || result.state.activity !== "wait") {
  console.error("\n失败：回来后应保持 wait 并标记 welcomeBack。");
  process.exit(1);
}

const held = game.tick(result.state, now + game.WELCOME_HOLD_MS - 1);
if (held.state.activity !== "wait") {
  console.error("\n失败：10 秒未到不应切换状态。");
  process.exit(1);
}

const done = game.tick(result.state, now + game.WELCOME_HOLD_MS);
screen("对话框结束之后", done.state, now + game.WELCOME_HOLD_MS, {
  welcomeBack: false,
  note: done.state.activity === "hungry"
    ? "空碗已超过 3 小时，切到 hungry，首页展示「等饭中...」。"
    : "切到 idle，首页展示「发呆中...」。",
});

if (hungry && done.state.activity !== "hungry") {
  console.error("\n失败：空碗分支结束后应为 hungry。");
  process.exit(1);
}
if (!hungry && done.state.activity !== "idle") {
  console.error("\n失败：有粮水分支结束后应为 idle。");
  process.exit(1);
}

console.log("\n-------- 微信开发者工具 Console 粘贴（时间在粘贴时重算） --------");
console.log(`(function () {
  var now = Date.now();
  var day = 24 * 60 * 60 * 1000;
  var state = ${JSON.stringify({
    food: state.food,
    water: state.water,
    status: "home",
    travelEndAt: 0,
    travelStartedAt: 0,
    lastTravelAt: 0,
    hasUnreadCard: false,
    collectedCards: [],
    activity: "wait",
    poseVariant: 1,
    idleKind: "lie",
    idleArt: 0,
  })};
  state.createdAt = now;
  state.emptySince = ${hungry ? "now - 3 * 60 * 60 * 1000 - 60 * 1000" : "0"};
  state.activityEndAt = now + 2 * 60 * 60 * 1000;
  state.nextDrinkCheckAt = now + 30 * day;
  state.nextEatCheckAt = now + 30 * day;
  state.nextTravelCheckAt = now + 30 * day;
  state.nextIdleArtAt = now + 30 * day;
  wx.setStorageSync('travel_cat_state_v1', state);
  wx.setStorageSync('travel_cat_has_left', 1);
  console.log('已写入「在等你」存档。把小程序切到后台再点回来：门口保持「在等你~」，对话框展示 10 秒后再换状态。');
})();`);
console.log("-------------------------------------------");
