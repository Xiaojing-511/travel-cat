#!/usr/bin/env node
/**
 * 把首页切到 decide（要出门吗...），用来看门口猫咪左边的书包。
 *
 * 用法：
 *   node scripts/demo-decide.js
 *
 * 1. 终端会先跑一遍逻辑，确认 showBag = true。
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
let state = far(game.applyActivity(game.createState(now), "decide", now, holdMs), now);
state = { ...state, food: 10, water: 10, emptySince: 0 };
const vm = game.viewModel(state, now);

console.log("场景：强制首页进入 decide，检查门口书包。");
console.log("");
console.log("======== 犹豫中（要出门吗...） ========");
console.log("activity      :", state.activity);
console.log("statusText    :", vm.statusText);
console.log("catPlace      :", vm.catPlace);
console.log("catSrc        :", vm.catSrc);
console.log("showBag       :", vm.showBag);
console.log("粮 / 水       :", vm.food + "g / " + vm.water + "g");
console.log("剩余          :", vm.statusRemainText);

if (state.activity !== "decide" || vm.catPlace !== "cat-door" || vm.showBag !== true) {
  console.error("\n失败：decide 时应在门口并显示书包。");
  process.exit(1);
}

console.log("\n-------- 微信开发者工具 Console 粘贴（先打开首页） --------");
console.log(`(function () {
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
    activity: 'decide',
    activityStartedAt: now,
    activityEndAt: now + hold,
    travelEndAt: 0,
    travelStartedAt: 0,
    welcomeHoldUntil: 0,
    reliefMealAt: 0,
    nextDrinkCheckAt: now + 30 * day,
    nextEatCheckAt: now + 30 * day,
    nextTravelCheckAt: now + 30 * day,
    nextIdleArtAt: now + 30 * day,
    poseVariant: 1
  });
  if (!(state.food > 0)) state.food = 10;
  if (!(state.water > 0)) state.water = 10;
  page.paint(state, now);
  var cache = wx.getStorageSync('travel_cat_cache_v1') || {};
  cache.player = Object.assign({}, cache.player || {}, state);
  cache.serverNow = now;
  wx.setStorageSync('travel_cat_cache_v1', cache);
  console.log('已切到 decide，约 10 分钟。门口应有书包。showBag=', page.data.showBag, 'catPlace=', page.data.catPlace);
})();`);
console.log("-------------------------------------------");
