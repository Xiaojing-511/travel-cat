#!/usr/bin/env node
/**
 * 把首页切到 drink（喝水中...），用来看吃饭/喝水共用的两帧循环。
 *
 * 用法：
 *   node scripts/demo-drink.js
 *
 * 1. 终端会先跑一遍逻辑，确认 catSrc = /images/cat/eat/001.png。
 * 2. 打开微信开发者工具首页，把文末 Console 整段粘贴进去。
 *    脚本会直接 paint 当前页，持续约 10 分钟；离开首页再回来会被云同步覆盖。
 */

const game = require("../miniprogram/utils/game.js");

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

const now = Date.now();
const holdMs = 10 * 60 * 1000;
let state = far(
  game.applyActivity(game.createState(now), "drink", now, holdMs),
  now,
);
state = { ...state, food: 10, water: 10, emptySince: 0 };
const vm = game.viewModel(state, now);

console.log("场景：强制首页进入 drink，检查喝水素材。");
console.log("");
console.log("======== 喝水中... ========");
console.log("activity      :", state.activity);
console.log("statusText    :", vm.statusText);
console.log("catPlace      :", vm.catPlace);
console.log("catSrc        :", vm.catSrc);
console.log("eating        :", vm.eating);
console.log("粮 / 水       :", vm.food + "g / " + vm.water + "g");
console.log("剩余          :", vm.statusRemainText);

if (
  state.activity !== "drink" ||
  vm.catSrc !== game.EAT_SRC ||
  vm.eating !== true ||
  vm.statusText !== "喝水中..."
) {
  console.error("\n失败：drink 应显示吃饭第一帧，文案为喝水中...。");
  process.exit(1);
}

console.log("\n-------- 微信开发者工具 Console 粘贴（先打开首页） --------");
console.log(`(function demoDrinkArt() {
  var pages = getCurrentPages();
  var page = pages[pages.length - 1];
  if (!page || typeof page.paint !== 'function') {
    console.error('请先打开首页再粘贴');
    return;
  }
  var now = Date.now();
  var day = 24 * 60 * 60 * 1000;
  var hold = 10 * 60 * 1000;
  var state = Object.assign({}, page.state || {}, {
    status: 'home',
    activity: 'drink',
    activityStartedAt: now,
    activityEndAt: now + hold,
    travelEndAt: 0,
    travelStartedAt: 0,
    welcomeHoldUntil: 0,
    reliefMealAt: 0,
    nextDrinkCheckAt: now + 30 * day,
    nextEatCheckAt: now + 30 * day,
    nextTravelCheckAt: now + 30 * day,
    nextIdleArtAt: now + 30 * day
  });
  if (!(state.food > 0)) state.food = 10;
  if (!(state.water > 0)) state.water = 10;
  page.paint(state, now);
  var cache = wx.getStorageSync('travel_cat_cache_v1') || {};
  cache.player = Object.assign({}, cache.player || {}, state);
  cache.serverNow = now;
  wx.setStorageSync('travel_cat_cache_v1', cache);
  console.log('已切到 drink，约 10 分钟。素材应为 /images/cat/eat/001.png 与 002.png 每秒切换');
  console.log({
    activity: page.state.activity,
    statusText: page.data.statusText,
    catSrc: page.data.catSrc,
    eating: page.data.eating
  });
})();`);
console.log("-------------------------------------------");
