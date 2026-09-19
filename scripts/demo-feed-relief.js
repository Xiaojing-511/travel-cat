#!/usr/bin/env node
/**
 * 场景：空碗超过 3 小时后玩家添粮。
 * 旅行中不会触发；其他状态保持 5 秒，再随机切到吃饭/喝水（扣 5g 或 10g）。
 *
 * 用法：
 *   node scripts/demo-feed-relief.js
 *   node scripts/demo-feed-relief.js --sleep
 *
 * 微信开发者工具：粘贴文末代码后重新进入首页，点「喂」，等 5 秒看吃饭/喝水。
 */

const game = require("../miniprogram/utils/game.js");

const fromSleep = process.argv.indexOf("--sleep") >= 0;

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
  console.log("catSrc        :", vm.catSrc || "(无)");
  console.log("粮 / 水       :", vm.food + "g / " + vm.water + "g");
  console.log("剩余          :", vm.statusRemainText);
  if (extra && extra.note) console.log("说明          :", extra.note);
}

const now = Date.now();
const activity = fromSleep ? "sleep" : "hungry";
let state = far(game.applyActivity(game.createState(now), activity, now, 2 * game.HOUR_MS), now);
state = {
  ...state,
  food: 0,
  water: 0,
  emptySince: now - game.EMPTY_HUNGRY_MS - 60 * 1000,
};

console.log("场景：空碗已超过 3 小时，玩家添粮。当前动作：", activity);

screen("添粮前", state, now, {
  note: fromSleep ? "睡觉中，碗是空的。" : "等饭中...，等玩家喂。",
});

state = game.feed(state, now);
screen("刚点「喂」", state, now, {
  note: "粮水各 +10g，状态先不换，倒计时约 5 秒。",
});

if (state.activity !== activity || !(state.reliefMealAt > 0)) {
  console.error("\n失败：添粮后应保持原状态并预约 5 秒后吃饭/喝水。");
  process.exit(1);
}

const held = game.tick(state, now + game.RELIEF_MEAL_DELAY_MS - 1);
if (held.state.activity !== activity) {
  console.error("\n失败：5 秒未到不应切换。");
  process.exit(1);
}

game.setRandom(() => 0);
const done = game.tick(state, now + game.RELIEF_MEAL_DELAY_MS);
screen("5 秒之后（演示强制吃饭 5g）", done.state, now + game.RELIEF_MEAL_DELAY_MS, {
  note: "真机里吃饭/喝水、5g/10g 都是随机的。",
});
game.setRandom();

if (done.state.activity !== "eat" && done.state.activity !== "drink") {
  console.error("\n失败：到期后应进入 eat 或 drink。");
  process.exit(1);
}

console.log("\n-------- 微信开发者工具 Console 粘贴 --------");
console.log(`(function () {
  var now = Date.now();
  var day = 24 * 60 * 60 * 1000;
  var state = ${JSON.stringify({
    food: 0,
    water: 0,
    status: "home",
    travelEndAt: 0,
    travelStartedAt: 0,
    lastTravelAt: 0,
    hasUnreadCard: false,
    collectedCards: [],
    activity: activity,
    poseVariant: 0,
    idleKind: "lie",
    idleArt: 0,
  })};
  state.createdAt = now;
  state.emptySince = now - 3 * 60 * 60 * 1000 - 60 * 1000;
  state.activityEndAt = now + 2 * 60 * 60 * 1000;
  state.nextDrinkCheckAt = now + 30 * day;
  state.nextEatCheckAt = now + 30 * day;
  state.nextTravelCheckAt = now + 30 * day;
  state.nextIdleArtAt = now + 30 * day;
  wx.setStorageSync('travel_cat_state_v1', state);
  wx.setStorageSync('travel_cat_has_left', 1);
  console.log('已写入空碗超过 3 小时的存档。重新进入首页后点「喂」，等 5 秒应出现吃饭或喝水。');
})();`);
console.log("-------------------------------------------");
