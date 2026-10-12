const assert = require("assert");
const game = require("../miniprogram/utils/game.js");
const tripImage = require("../miniprogram/utils/tripImage.js");
const reviewCards = require("../miniprogram/data/review-cards.js");
const { backText, pickBackText } = require("../miniprogram/data/back.js");
const cards = require("../cloudfunctions/player/lib/cards.js");

function roundtrip(state) {
  return game.normalize(JSON.parse(JSON.stringify(state)), 0);
}

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

function almostOne() {
  return 1 - Number.EPSILON;
}

const feedRaw = game.feed;
game.feed = function (state, now) {
  const have = Math.max(0, Math.floor(Number(state && state.leafCount) || 0));
  if (have >= game.FEED_LEAF_COST) return feedRaw(state, now);
  const funded = Object.assign({}, state, { leafCount: game.FEED_LEAF_COST });
  const next = feedRaw(funded, now);
  if (next === funded) return state;
  return Object.assign({}, next, { leafCount: have });
};

const templates = [
  {
    id: "t1",
    location: "海边小路",
    image: "",
    journal: "浪一声一声拍过来。",
  },
  {
    id: "t2",
    location: "老巷子",
    image: "",
    journal: "路灯先亮了我的胡须。",
  },
];

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log("ok", name);
  } finally {
    game.setRandom();
  }
}

test("initial home is hungry and can feed", () => {
  const state = game.createState(1);
  assert.strictEqual(state.food, 0);
  assert.strictEqual(state.water, 0);
  assert.strictEqual(state.status, "home");
  assert.strictEqual(game.canFeed(state), true);
  assert.ok(["sleep", "idle", "decide"].indexOf(state.activity) >= 0);
  const vm = game.viewModel(state, 1);
  assert.strictEqual(vm.foodBowlSrc, "/images/food/0.png");
  assert.strictEqual(vm.waterBowlSrc, "/images/water/0.png");
});

test("bowl art steps by remaining grams", () => {
  assert.strictEqual(game.getBowlSrc("food", 0), "/images/food/0.png");
  assert.strictEqual(game.getBowlSrc("food", 1), "/images/food/10.png");
  assert.strictEqual(game.getBowlSrc("food", 10), "/images/food/10.png");
  assert.strictEqual(game.getBowlSrc("food", 11), "/images/food/20.png");
  assert.strictEqual(game.getBowlSrc("water", 20), "/images/water/20.png");
  assert.strictEqual(game.getBowlSrc("water", 41), "/images/water/50.png");
  assert.strictEqual(game.getBowlSrc("water", 50), "/images/water/50.png");
  assert.strictEqual(game.getBowlSrc("food", 80), "/images/food/50.png");
});

test("feed adds 10g each tap up to 50g", () => {
  let state = game.createState(1);
  state = game.feed(state, 1);
  assert.strictEqual(state.food, 10);
  assert.strictEqual(state.water, 10);
  assert.strictEqual(game.canFeed(state), true);
  state = game.feed(state, 1);
  assert.strictEqual(state.food, 20);
  assert.strictEqual(state.water, 20);
  for (let i = 0; i < 3; i++) state = game.feed(state, 1);
  assert.strictEqual(state.food, 50);
  assert.strictEqual(state.water, 50);
  assert.strictEqual(game.canFeed(state), false);
  const again = game.feed(state, 1);
  assert.strictEqual(again, state);
});

test("feed spends 20 leaves and refuses a short stack", () => {
  let state = { ...game.createState(1), leafCount: 19 };
  assert.strictEqual(game.feedBlockedByLeaves(state, 1), true);
  assert.strictEqual(feedRaw(state, 1), state);

  state = { ...state, leafCount: 20 };
  const fed = feedRaw(state, 1);
  assert.strictEqual(fed.food, 10);
  assert.strictEqual(fed.water, 10);
  assert.strictEqual(fed.leafCount, 0);

  const full = feedRaw({ ...fed, food: 50, water: 50, leafCount: 25 }, 1);
  assert.strictEqual(full.leafCount, 25);
  assert.strictEqual(full.food, 50);
});

test("idle loops two idle frames and ignores food", () => {
  assert.deepStrictEqual(game.IDLE_ARTS, ["/images/cat/idle/001.png"]);
  assert.strictEqual(game.IDLE_FRAME_MS, 1700);
  game.setRandom(() => 0);
  let state = game.applyActivity(game.createState(1), "idle", 1, 1000);
  const start = state.activityStartedAt;
  assert.strictEqual(game.getCatSrc(state, start), "/images/cat/idle/001.png");
  assert.strictEqual(
    game.getCatSrc(state, start + game.IDLE_FRAME_MS),
    "/images/cat/idle/002.png",
  );
  assert.strictEqual(
    game.getCatSrc(state, start + game.IDLE_FRAME_MS * 2),
    "/images/cat/idle/001.png",
  );
  game.setRandom(() => almostOne());
  state = game.applyActivity(game.createState(1), "idle", 1, 1000);
  assert.strictEqual(state.idleArt, 0);
  assert.strictEqual(game.getCatSrc(state, 1), "/images/cat/idle/001.png");

  state = { ...state, idleArt: 0, food: 0, water: 0 };
  assert.strictEqual(game.getCatSrc(state, 1), "/images/cat/idle/001.png");
  state = game.feed(state, 1);
  assert.strictEqual(game.getCatSrc(state, 1), "/images/cat/idle/001.png");
  assert.strictEqual(state.food, 10);
  state = { ...state, idleArt: 3 };
  assert.strictEqual(game.getCatSrc(state, 1), "/images/cat/idle/001.png");
  const loaded = roundtrip(state);
  assert.strictEqual(loaded.idleArt, 0);
  assert.strictEqual(game.getCatSrc(loaded, 0), "/images/cat/idle/001.png");
  const idleVm = game.viewModel(state, 1);
  assert.strictEqual(idleVm.idling, true);
  assert.deepStrictEqual(idleVm.idleFrames, [
    "/images/cat/idle/001.png",
    "/images/cat/idle/002.png",
  ]);
  assert.strictEqual(game.usesLoopFrames(state), true);

  const legacyStand = game.normalize(
    {
      activity: "idle",
      idleKind: "stand",
      poseVariant: 0,
      food: 0,
      water: 0,
    },
    1,
  );
  assert.strictEqual(game.getCatSrc(legacyStand, 1), "/images/cat/idle/001.png");
});

test("hungry loops the same idle frames", () => {
  let state = game.applyActivity(game.createState(1), "hungry", 1, 1000);
  const start = state.activityStartedAt;
  assert.strictEqual(game.getStatusText(state), "等饭中...");
  assert.strictEqual(game.getCatSrc(state, start), "/images/cat/idle/001.png");
  assert.strictEqual(
    game.getCatSrc(state, start + game.IDLE_FRAME_MS),
    "/images/cat/idle/002.png",
  );
  assert.strictEqual(game.usesLoopFrames(state), true);
  const vm = game.viewModel(state, start);
  assert.strictEqual(vm.idling, true);
  assert.deepStrictEqual(vm.idleFrames, [
    "/images/cat/idle/001.png",
    "/images/cat/idle/002.png",
  ]);
  const lan = { ...state, breed: "blue-golden", breedLocked: true };
  assert.strictEqual(
    game.getCatSrc(lan, start),
    "/images/cat-lanji/idle/001.png",
  );
  assert.deepStrictEqual(game.viewModel(lan, start).idleFrames, [
    "/images/cat-lanji/idle/001.png",
    "/images/cat-lanji/idle/002.png",
  ]);
});

test("idle pose stays put while the two frames loop", () => {
  game.setRandom(() => 0);
  let state = game.applyActivity(
    game.createState(1),
    "idle",
    1000,
    20 * game.MINUTE_MS,
  );
  state = {
    ...state,
    idleArt: 0,
    nextIdleArtAt: 1000 + game.IDLE_ART_MIN_MS,
    nextDrinkCheckAt: 1000 + 30 * game.DAY_MS,
    nextEatCheckAt: 1000 + 30 * game.DAY_MS,
    planters: (state.planters || []).map((pot) => ({
      ...pot,
      nextGrowAt: 1000 + 30 * game.DAY_MS,
    })),
  };
  assert.strictEqual(game.getCatSrc(state, 1000), "/images/cat/idle/001.png");
  assert.strictEqual(
    game.getCatSrc(state, 1700 + game.IDLE_FRAME_MS),
    "/images/cat/idle/002.png",
  );
  const waiting = game.tick(state, 1000 + game.IDLE_ART_MIN_MS - 1, templates);
  assert.strictEqual(waiting.changed, false);
  assert.strictEqual(waiting.state.idleArt, 0);
  assert.strictEqual(waiting.state.activity, "idle");

  const held = game.tick(state, 1000 + game.IDLE_ART_MIN_MS, templates);
  assert.strictEqual(held.changed, false);
  assert.strictEqual(held.state.activity, "idle");
  assert.strictEqual(held.state.idleArt, 0);
  assert.strictEqual(
    game.getCatSrc(held.state, 1000 + game.IDLE_ART_MIN_MS),
    "/images/cat/idle/001.png",
  );
});

test("sleep frames and wait use dedicated art", () => {
  let state = game.applyActivity(game.createState(1), "idle", 1, 1000);
  state = game.applyActivity(state, "sleep", 1, game.SLEEP_MIN_MS);
  const sleepStart = state.activityStartedAt;
  assert.strictEqual(game.SLEEP_FRAME_MS, 1000);
  assert.ok(game.getCatSrc(state, sleepStart).indexOf("sleep/001") >= 0);
  assert.ok(
    game
      .getCatSrc(state, sleepStart + game.SLEEP_FRAME_MS)
      .indexOf("sleep/002") >= 0,
  );
  assert.ok(
    game
      .getCatSrc(state, sleepStart + game.SLEEP_FRAME_MS * 2)
      .indexOf("sleep/003") >= 0,
  );
  assert.ok(
    game
      .getCatSrc(state, sleepStart + game.SLEEP_FRAME_MS * 3)
      .indexOf("sleep/002") >= 0,
  );
  assert.ok(
    game
      .getCatSrc(state, sleepStart + game.SLEEP_FRAME_MS * 4)
      .indexOf("sleep/001") >= 0,
  );
  assert.strictEqual(game.getStatusText(state), "睡觉中...");
  const sleepVm = game.viewModel(state, 0);
  assert.strictEqual(sleepVm.sleeping, true);
  assert.strictEqual(sleepVm.sleepFrames.length, 3);
  assert.strictEqual(sleepVm.eating, false);
  state = game.applyActivity(state, "wait", 1, 1000);
  const waitStart = state.activityStartedAt;
  assert.strictEqual(game.getCatSrc(state, waitStart), "/images/cat/wait.png");
  assert.strictEqual(
    game.getCatSrc(state, waitStart + 1000),
    "/images/cat/wait.png",
  );
  assert.strictEqual(
    game.getCatSrc({ ...state, poseVariant: 1 }, waitStart),
    "/images/cat/wait.png",
  );
  assert.ok(game.getStatusText(state).indexOf("在等你") >= 0);
  const waitVm = game.viewModel(state, waitStart);
  assert.strictEqual(waitVm.catSrc, "/images/cat/wait.png");
  assert.strictEqual(waitVm.catPlace, "cat-door");
  assert.strictEqual(waitVm.showBag, true);
  assert.strictEqual(game.usesLoopFrames(state), false);
  assert.strictEqual(sleepVm.showStatusBar, false);
  assert.strictEqual(game.viewModel(state, 1).showStatusBar, true);
});

test("bag stays visible at home and hides only while traveling", () => {
  let state = game.applyActivity(game.createState(1), "decide", 1);
  const decideVm = game.viewModel(state, 1);
  assert.strictEqual(decideVm.catPlace, "cat-door");
  assert.strictEqual(decideVm.showBag, true);
  assert.strictEqual(decideVm.showStatusBar, true);
  state = game.applyActivity(state, "wait", 1);
  assert.strictEqual(game.viewModel(state, 1).showBag, true);
  state = game.applyActivity(state, "idle", 1);
  assert.strictEqual(game.viewModel(state, 1).showBag, true);
  assert.strictEqual(game.viewModel(state, 1).showStatusBar, false);
  const away = game.depart(
    game.feed(game.createState(1), 1),
    1000,
    5 * 60 * 1000,
  );
  assert.strictEqual(game.viewModel(away, 1000).showBag, false);
});

test("drink loops the two eat frames under the water bowl", () => {
  let state = game.applyActivity(
    game.createState(1),
    "drink",
    1,
    game.MINUTE_MS,
  );
  const start = state.activityStartedAt;
  assert.strictEqual(game.EAT_FRAME_MS, 1000);
  assert.strictEqual(game.getCatSrc(state, start), game.EAT_SRC);
  assert.strictEqual(
    game.getCatSrc(state, start + game.EAT_FRAME_MS),
    "/images/cat/eat/002.png",
  );
  assert.strictEqual(
    game.getCatSrc(state, start + game.EAT_FRAME_MS * 2),
    game.EAT_SRC,
  );
  assert.strictEqual(game.getStatusText(state), "喝水中...");
  const drinkVm = game.viewModel(state, start);
  assert.strictEqual(drinkVm.eating, true);
  assert.strictEqual(drinkVm.meal, "drink");
  assert.strictEqual(drinkVm.sleeping, false);
  assert.strictEqual(drinkVm.catSrc, game.EAT_SRC);
  assert.deepStrictEqual(drinkVm.eatFrames, [
    "/images/cat/eat/001.png",
    "/images/cat/eat/002.png",
  ]);
  assert.strictEqual(game.usesLoopFrames(state), true);
});

test("leaving drink swaps off the drink pose", () => {
  game.setRandom(() => 0);
  let state = far(game.applyActivity(game.createState(1), "drink", 1, 1000), 1);
  const before = game.viewModel(state, 1);
  assert.strictEqual(before.statusText, "喝水中...");
  assert.strictEqual(before.catSrc, game.EAT_SRC);
  const ended = game.tick(state, state.activityEndAt, templates);
  assert.notStrictEqual(ended.state.activity, "drink");
  const after = game.viewModel(ended.state, state.activityEndAt);
  assert.notStrictEqual(after.catSrc, game.EAT_SRC);
  assert.ok(after.catSrc);
  assert.deepStrictEqual(after.catPoseKey, [after.catSrc]);
  if (ended.state.activity === "idle") {
    assert.strictEqual(after.statusText, "发呆中...");
    assert.ok(game.IDLE_ARTS.indexOf(after.catSrc) >= 0);
  }
});

test("eat loops two frames one second apart", () => {
  let state = game.applyActivity(game.createState(1), "eat", 1, game.MINUTE_MS);
  const start = state.activityStartedAt;
  assert.strictEqual(game.EAT_SRC, "/images/cat/eat/001.png");
  assert.strictEqual(game.getCatSrc(state, start), game.EAT_SRC);
  assert.strictEqual(
    game.getCatSrc(state, start + 4000),
    "/images/cat/eat/001.png",
  );
  assert.strictEqual(
    game.getCatSrc(state, start + game.EAT_FRAME_MS),
    "/images/cat/eat/002.png",
  );
  assert.strictEqual(game.getStatusText(state), "吃饭中...");
  const eatVm = game.viewModel(state, start);
  assert.strictEqual(eatVm.eating, true);
  assert.strictEqual(eatVm.meal, "eat");
  assert.strictEqual(eatVm.sleeping, false);
  assert.strictEqual(eatVm.catSrc, game.EAT_SRC);
  assert.strictEqual(eatVm.catPlace, "cat-near");
  assert.strictEqual(game.usesLoopFrames(state), true);
});

test("sleep uses 20min-5h range and can be driven by explicit duration", () => {
  assert.strictEqual(game.SLEEP_MIN_MS, 20 * game.MINUTE_MS);
  assert.strictEqual(game.SLEEP_MAX_MS, 5 * game.HOUR_MS);
  game.setRandom(() => 0);
  let state = game.applyActivity(game.createState(1), "sleep", 1000);
  assert.strictEqual(state.activityEndAt - 1000, game.SLEEP_MIN_MS);
  game.setRandom(almostOne);
  state = game.applyActivity(game.createState(1), "sleep", 1000);
  assert.strictEqual(state.activityEndAt - 1000, game.SLEEP_MAX_MS);

  state = far(
    game.applyActivity(game.createState(1), "sleep", 1000, 5 * 60 * 1000),
    1000,
  );
  const mid = game.tick(state, 1000 + 5 * 60 * 1000 - 1, templates);
  assert.strictEqual(mid.changed, false);
  assert.strictEqual(mid.state.activity, "sleep");
  const done = game.tick(state, 1000 + 5 * 60 * 1000, templates);
  assert.strictEqual(done.changed, true);
  assert.notStrictEqual(done.state.activity, "sleep");
});

test("idle and wait durations follow the new ranges", () => {
  assert.strictEqual(game.IDLE_MIN_MS, 2 * game.MINUTE_MS);
  assert.strictEqual(game.IDLE_MAX_MS, 10 * game.MINUTE_MS);
  game.setRandom(() => 0);
  let state = game.applyActivity(game.createState(1), "idle", 1);
  assert.strictEqual(state.activityEndAt - 1, game.IDLE_MIN_MS);
  state = game.applyActivity(state, "wait", 1);
  assert.strictEqual(state.activityEndAt - 1, game.WAIT_MIN_MS);
  game.setRandom(almostOne);
  state = game.applyActivity(state, "idle", 1);
  assert.strictEqual(state.activityEndAt - 1, game.IDLE_MAX_MS);
  state = game.applyActivity(state, "wait", 1);
  assert.strictEqual(state.activityEndAt - 1, game.WAIT_MAX_MS);
});

test("next home activity never repeats the current one", () => {
  for (let i = 0; i < 40; i++) {
    const next = game.pickNextActivity(
      {
        activity: "wait",
        food: 10,
        water: 10,
        emptySince: 0,
      },
      1,
    );
    assert.notStrictEqual(next, "wait");
    assert.ok(["sleep", "idle", "decide"].indexOf(next) >= 0);
  }
  const later = 1 + game.EMPTY_HUNGRY_MS + 1;
  for (let i = 0; i < 40; i++) {
    const next = game.pickNextActivity(
      {
        activity: "idle",
        food: 0,
        water: 0,
        emptySince: 1,
      },
      later,
      { online: false },
    );
    assert.notStrictEqual(next, "idle");
    assert.ok(["sleep", "wait", "decide", "hungry"].indexOf(next) >= 0);
  }
});

test("online rotation never picks wait", () => {
  const seen = {};
  for (let i = 0; i < 40; i++) {
    const next = game.pickNextActivity(
      {
        activity: "idle",
        food: 10,
        water: 10,
        emptySince: 0,
      },
      1,
    );
    assert.notStrictEqual(next, "wait");
    assert.ok(["sleep", "idle", "decide"].indexOf(next) >= 0);
    seen[next] = true;
  }
  assert.ok(seen.sleep || seen.decide);
  let state = far(game.applyActivity(game.createState(1), "idle", 1, 1000), 1);
  state = { ...state, food: 10, water: 10, emptySince: 0 };
  game.setRandom(() => 0.9);
  const result = game.tick(state, 1000, templates);
  assert.notStrictEqual(result.state.activity, "wait");
});

test("offline rotation can pick wait", () => {
  const seen = {};
  for (let i = 0; i < 80; i++) {
    const next = game.pickNextActivity(
      {
        activity: "idle",
        food: 10,
        water: 10,
        emptySince: 0,
      },
      1,
      { online: false },
    );
    seen[next] = true;
  }
  assert.strictEqual(seen.wait, true);
  assert.strictEqual(seen.decide, true);
});

test("decide duration is 12-25s and can travel or stay", () => {
  game.setRandom(() => 0);
  let state = game.applyActivity(game.createState(1), "decide", 1);
  assert.strictEqual(state.activityEndAt - 1, game.DECIDE_MIN_MS);
  game.setRandom(almostOne);
  state = game.applyActivity(state, "decide", 1);
  assert.strictEqual(state.activityEndAt - 1, game.DECIDE_MAX_MS);
  assert.strictEqual(game.getStatusText(state), "要出门吗...");
  assert.strictEqual(game.getCatSrc(state), "/images/cat/wait.png");

  state = far(game.applyActivity(game.createState(1), "decide", 1, 1000), 1);
  state = { ...state, food: 10, water: 10, emptySince: 0 };
  game.setRandom(() => 0);
  const gone = game.tick(state, 1001, templates);
  assert.strictEqual(gone.state.status, "traveling");

  game.setRandom(almostOne);
  const stayed = game.tick(state, 1001, templates);
  assert.notStrictEqual(stayed.state.status, "traveling");
  assert.notStrictEqual(stayed.state.activity, "decide");
});

test("depart plans duration by supply band and caps at 48h", () => {
  assert.strictEqual(game.LOW_TRAVEL_MIN_MS, 30 * game.MINUTE_MS);
  assert.strictEqual(game.MID_TRAVEL_MIN_MS, game.HOUR_MS);
  assert.strictEqual(game.HIGH_TRAVEL_MIN_MS, 3 * game.HOUR_MS);
  game.setRandom(() => 0);
  let low = game.depart(game.createState(1), 1000);
  assert.strictEqual(low.status, "traveling");
  assert.strictEqual(low.food, 0);
  assert.strictEqual(low.water, 0);
  assert.strictEqual(low.travelEndAt - 1000, game.LOW_TRAVEL_MIN_MS);
  assert.ok(low.travelId);
  assert.strictEqual(low.activityStartedAt != null ? true : false, true);
  assert.ok(low.nextTravelCheckAt >= low.travelEndAt + game.MINUTE_MS);

  assert.strictEqual(game.travelBand({ food: 10, water: 10 }), "low");
  assert.strictEqual(game.travelBand({ food: 19, water: 40 }), "low");
  assert.strictEqual(game.travelBand({ food: 20, water: 20 }), "mid");
  assert.strictEqual(game.travelBand({ food: 30, water: 29 }), "mid");
  assert.strictEqual(game.travelBand({ food: 30, water: 30 }), "high");

  let mid = game.depart(
    { ...game.createState(1), food: 20, water: 20 },
    1000,
  );
  assert.strictEqual(mid.travelBand, "mid");
  assert.strictEqual(mid.travelEndAt - 1000, game.MID_TRAVEL_MIN_MS);
  assert.strictEqual(mid.food, 20);
  assert.strictEqual(mid.water, 20);

  let high = game.depart(
    { ...game.createState(1), food: 30, water: 30 },
    1000,
  );
  assert.strictEqual(high.travelBand, "high");
  assert.strictEqual(high.travelEndAt - 1000, game.HIGH_TRAVEL_MIN_MS);

  const capped = game.depart(
    game.feed(game.createState(1), 1),
    1000,
    game.TRAVEL_MAX_MS + 9999,
  );
  assert.strictEqual(capped.travelEndAt - 1000, game.TRAVEL_MAX_MS);
});

test("travel consume table matches duration and stock", () => {
  const low = { food: 6, water: 4 };
  assert.deepStrictEqual(game.travelCost("low", game.HOUR_MS, low), {
    food: 6,
    water: 4,
  });
  assert.deepStrictEqual(game.travelCost("mid", 6 * game.HOUR_MS, {}), {
    food: 0,
    water: 0,
  });
  assert.deepStrictEqual(game.travelCost("mid", 6 * game.HOUR_MS + 1, {}), {
    food: 10,
    water: 10,
  });
  assert.deepStrictEqual(game.travelCost("high", 12 * game.HOUR_MS + 1, {}), {
    food: 20,
    water: 10,
  });
  assert.deepStrictEqual(game.travelCost("high", 7 * game.HOUR_MS, {}), {
    food: 10,
    water: 10,
  });

  let state = { ...game.createState(1), food: 30, water: 30 };
  state = game.depart(state, 1000, 13 * game.HOUR_MS);
  assert.strictEqual(state.travelBand, "high");
  assert.strictEqual(state.food, 10);
  assert.strictEqual(state.water, 20);
});

test("low supply can still depart through decide", () => {
  let state = far(
    game.applyActivity(game.createState(1), "decide", 1, 1000),
    1,
  );
  game.setRandom(() => 0);
  const gone = game.tick(state, 1001, templates);
  assert.strictEqual(gone.state.status, "traveling");
  assert.strictEqual(gone.state.food, 0);
  assert.strictEqual(gone.state.water, 0);
});

test("travel UI shows remaining time and elapsed duration", () => {
  let state = game.depart(
    game.feed(game.createState(1), 1),
    1000,
    5 * 60 * 1000,
  );
  const vm = game.viewModel(state, 1000);
  assert.strictEqual(vm.traveling, true);
  assert.strictEqual(vm.catSrc, "");
  assert.strictEqual(vm.showBag, false);
  assert.ok(vm.statusText.indexOf("旅行中") >= 0);
  assert.strictEqual(vm.remainText, "5:00");
  assert.strictEqual(vm.statusRemainText, "5:00");
  assert.strictEqual(vm.awayText, "已出门 0 分钟");
  assert.strictEqual(
    game.viewModel(state, 1000 + 60 * 1000).awayText,
    "已出门 1 分钟",
  );
  assert.strictEqual(
    game.viewModel(state, 1000 + 65 * 60 * 1000).awayText,
    "已出门 1 小时 5 分钟",
  );
  assert.strictEqual(
    game.viewModel(state, 1000 + (24 * 60 + 125) * 60 * 1000).awayText,
    "已出门 1 天 2 小时 5 分钟",
  );
  assert.strictEqual(game.formatRemain(game.HOUR_MS), "1:00:00");
});

test("home status remaining time follows activityEndAt", () => {
  const state = game.applyActivity(
    game.createState(1),
    "idle",
    1000,
    90 * 1000,
  );
  assert.strictEqual(game.statusRemainMs(state, 1000), 90 * 1000);
  assert.strictEqual(game.viewModel(state, 1000).statusRemainText, "1:30");
  assert.strictEqual(
    game.viewModel(state, 1000 + 30 * 1000).statusRemainText,
    "1:00",
  );
});

test("travel stays in progress until duration ends", () => {
  let state = game.depart(
    game.feed(game.createState(1), 1),
    1000,
    5 * 60 * 1000,
  );
  const mid = game.tick(state, 1000 + 5 * 60 * 1000 - 1, templates);
  assert.strictEqual(mid.completed, false);
  assert.strictEqual(mid.state.status, "traveling");
  assert.strictEqual(game.formatRemain(mid.remainMs), "0:01");
});

test("travel complete creates a first-person card and unread dot", () => {
  let state = game.depart(
    game.feed(game.createState(1), 1),
    1000,
    5 * 60 * 1000,
  );
  state = { ...state, debugForceJournal: true };
  const done = game.tick(state, 1000 + 5 * 60 * 1000, templates);
  assert.strictEqual(done.completed, true);
  assert.strictEqual(done.state.status, "home");
  assert.strictEqual(done.state.hasUnreadCard, true);
  assert.strictEqual(done.state.unreadCount, 1);
  assert.strictEqual(done.state.collectedCards.length, 1);
  assert.strictEqual(done.newCards.length, 1);
  const card = done.state.collectedCards[0];
  assert.strictEqual(done.newCards[0].id, card.id);
  assert.strictEqual(card.unread, true);
  assert.ok(card.location);
  assert.ok(card.journal);
  assert.ok(templates.some((item) => item.id === card.templateId));
  assert.strictEqual(done.state.travelId, "");
  assert.strictEqual(done.state.lastCardTemplateId, card.templateId);
  assert.strictEqual(done.state.cardCount, 1);
  assert.ok(!game.toPlayerDoc(done.state).collectedCards);
  assert.strictEqual(done.state.travelEndAt, 0);
  assert.strictEqual(card.startedAt, 1000);
  assert.ok(card.journaledAt >= 1000);
  assert.ok(card.journaledAt < 1000 + 5 * 60 * 1000);
});

test("old cards get start and in-trip times without changing later", () => {
  const collectedAt = 1000000;
  const loaded = game.normalize(
    {
      collectedCards: [
        {
          id: "old-1",
          templateId: "t1",
          location: "海边小路",
          image: "",
          journal: "浪一声一声拍过来。",
          collectedAt,
        },
      ],
    },
    collectedAt,
  );
  const card = loaded.collectedCards[0];
  assert.strictEqual(card.startedAt, collectedAt - game.TRAVEL_DURATION_MS);
  assert.ok(card.journaledAt >= card.startedAt);
  assert.ok(card.journaledAt < collectedAt);
  const again = game.normalize(loaded, collectedAt).collectedCards[0];
  assert.strictEqual(again.journaledAt, card.journaledAt);
});

test("closing and reopening restores unfinished travel", () => {
  let state = game.depart(
    game.feed(game.createState(1), 1),
    1000,
    5 * 60 * 1000,
  );
  const loaded = roundtrip(state);
  assert.strictEqual(loaded.status, "traveling");
  assert.strictEqual(loaded.travelEndAt, state.travelEndAt);
  const still = game.tick(loaded, 1000 + 60 * 1000, templates);
  assert.strictEqual(still.completed, false);
});

test("reopening after travel ended generates card and unread reminder", () => {
  let state = game.depart(
    game.feed(game.createState(1), 1),
    1000,
    5 * 60 * 1000,
  );
  const loaded = roundtrip(state);
  const done = game.tick(loaded, 1000 + 5 * 60 * 1000 + 5000, templates);
  assert.strictEqual(done.completed, true);
  assert.strictEqual(done.state.hasUnreadCard, true);
  assert.strictEqual(done.state.collectedCards.length, 1);
  const read = game.markCardRead(done.state, done.newCards[0].id);
  assert.strictEqual(read.unreadCount, 0);
  assert.strictEqual(read.hasUnreadCard, false);
  assert.strictEqual(read.collectedCards[0].unread, false);
  assert.strictEqual(game.toPlayerDoc(read).hasUnreadCard, false);
});

test("home dot stays until every new photo journal is opened", () => {
  const state = {
    ...game.createState(1),
    collectedCards: [
      { id: "a", unread: true, templateId: "t1" },
      { id: "b", unread: true, templateId: "t2" },
    ],
    unreadCount: 2,
    hasUnreadCard: true,
    journalReadModel: 1,
  };
  const once = game.markCardRead(state, "a");
  assert.strictEqual(once.unreadCount, 1);
  assert.strictEqual(once.hasUnreadCard, true);
  const twice = game.markCardRead(once, "b");
  assert.strictEqual(twice.unreadCount, 0);
  assert.strictEqual(twice.hasUnreadCard, false);
});

test("old journal records do not gain an unread dot", () => {
  const old = game.normalize(
    {
      hasUnreadCard: true,
      collectedCards: [
        {
          id: "old",
          templateId: "t1",
          location: "海边小路",
          journal: "浪一声一声拍过来。",
          collectedAt: 1,
        },
      ],
    },
    1,
  );
  assert.strictEqual(old.hasUnreadCard, false);
  assert.strictEqual(old.unreadCount, 0);
  assert.ok(!old.collectedCards[0].unread);
  const kept = game.normalize(
    game.toPlayerDoc({
      ...old,
      unreadCount: 1,
      hasUnreadCard: true,
      journalReadModel: 1,
    }),
    2,
  );
  assert.strictEqual(kept.hasUnreadCard, true);
  assert.strictEqual(kept.unreadCount, 1);
});

test("second trip works after feeding again", () => {
  let state = game.depart(
    game.feed(game.createState(1), 1),
    1000,
    5 * 60 * 1000,
  );
  state = game.tick(state, 1000 + 5 * 60 * 1000, templates).state;
  state = game.feed(state, 200000);
  state = game.depart(state, 200000, 5 * 60 * 1000);
  const second = game.tick(state, 200000 + 5 * 60 * 1000, templates);
  assert.strictEqual(second.state.collectedCards.length, 2);
  assert.strictEqual(second.newCards.length, 1);
  assert.strictEqual(second.state.cardCount, 2);
});

test("depart locks travelId and completeTravel does not reroll it", () => {
  let state = game.depart(
    game.feed(game.createState(1), 1),
    1000,
    5 * 60 * 1000,
    templates,
  );
  assert.ok(templates.some((item) => item.id === state.travelId));
  const locked = state.travelId;
  state = { ...state, debugForceJournal: true };
  const done = game.tick(state, 1000 + 5 * 60 * 1000, templates);
  assert.strictEqual(done.newCards[0].templateId, locked);
});

test("same travel completes to the same card id and journal time", () => {
  let state = game.depart(
    game.feed(game.createState(1), 1),
    1000,
    5 * 60 * 1000,
    templates,
  );
  const endedAt = 1000 + 5 * 60 * 1000;
  state = { ...state, debugForceJournal: true };
  const a = game.tick(state, endedAt, templates);
  const b = game.tick(state, endedAt, templates);
  const expectedId = game.cardId(1000, endedAt, state.travelId);
  assert.strictEqual(a.newCards[0].id, expectedId);
  assert.strictEqual(b.newCards[0].id, expectedId);
  assert.strictEqual(a.newCards[0].journaledAt, b.newCards[0].journaledAt);
  assert.strictEqual(a.newCards[0].templateId, state.travelId);
});

test("photo journal chance follows remaining food and water", () => {
  assert.strictEqual(game.journalBand({ food: 0, water: 0 }), "empty");
  assert.strictEqual(game.journalBand({ food: 0, water: 40 }), "half");
  assert.strictEqual(game.journalBand({ food: 8, water: 0 }), "half");
  assert.strictEqual(game.journalBand({ food: 9, water: 9 }), "short");
  assert.strictEqual(game.journalBand({ food: 10, water: 9 }), "full");
  assert.strictEqual(game.journalBand({ food: 10, water: 10 }), "full");
  assert.strictEqual(game.journalBand({ food: 30, water: 30 }), "full");

  let emptyJournals = 0;
  let halfJournals = 0;
  let shortJournals = 0;
  let fullJournals = 0;
  const total = 300;
  for (let i = 0; i < total; i++) {
    const startedAt = 1000000 + i * 60000;
    const endedAt = startedAt + 3 * 60 * 60 * 1000;
    if (game.bringsJournal(startedAt, endedAt, "empty")) emptyJournals += 1;
    if (game.bringsJournal(startedAt, endedAt, "half")) halfJournals += 1;
    if (game.bringsJournal(startedAt, endedAt, "short")) shortJournals += 1;
    if (game.bringsJournal(startedAt, endedAt, "full")) fullJournals += 1;
  }
  assert.ok(emptyJournals > total / 3 - 40);
  assert.ok(emptyJournals < total / 3 + 40);
  assert.ok(halfJournals > total / 2 - 40);
  assert.ok(halfJournals < total / 2 + 40);
  assert.ok(shortJournals > (total * 2) / 3 - 40);
  assert.ok(shortJournals < (total * 2) / 3 + 40);
  assert.strictEqual(fullJournals, total);

  const highTrip = game.depart(
    { ...game.createState(1), food: 30, water: 30 },
    1000,
    5 * 60 * 1000,
    templates,
  );
  assert.strictEqual(highTrip.travelBand, "high");
  assert.strictEqual(highTrip.journalBand, "full");
  assert.strictEqual(game.toPlayerDoc(highTrip).travelBand, "high");
  assert.strictEqual(game.toPlayerDoc(highTrip).journalBand, "full");
  const highDone = game.tick(highTrip, 1000 + 5 * 60 * 1000, templates);
  assert.strictEqual(game.isForgotCard(highDone.newCards[0]), false);
  assert.strictEqual(highDone.state.travelBand, "");
  assert.strictEqual(highDone.state.journalBand, "");

  const emptyTrip = game.depart(
    game.createState(1),
    1000,
    5 * 60 * 1000,
    templates,
  );
  assert.strictEqual(emptyTrip.journalBand, "empty");
  const emptyDone = game.tick(emptyTrip, 1000 + 5 * 60 * 1000, templates);
  const expectEmpty = game.bringsJournal(1000, 1000 + 5 * 60 * 1000, "empty");
  assert.strictEqual(game.isForgotCard(emptyDone.newCards[0]), !expectEmpty);

  const shortTrip = game.depart(
    { ...game.createState(1), food: 5, water: 8 },
    1000,
    5 * 60 * 1000,
    templates,
  );
  assert.strictEqual(shortTrip.journalBand, "short");
  assert.strictEqual(shortTrip.food, 0);
  assert.strictEqual(shortTrip.water, 0);

  const halfTrip = game.depart(
    { ...game.createState(1), food: 0, water: 20 },
    1000,
    5 * 60 * 1000,
    templates,
  );
  assert.strictEqual(halfTrip.journalBand, "half");

  let legacyHigh = 0;
  for (let i = 0; i < total; i++) {
    const startedAt = 1000000 + i * 60000;
    const endedAt = startedAt + 3 * 60 * 60 * 1000;
    if (game.bringsJournal(startedAt, endedAt, "high")) legacyHigh += 1;
  }
  assert.ok(legacyHigh > (total * 2) / 3 - 40);
  assert.ok(legacyHigh < (total * 2) / 3 + 40);

  let state = game.depart(
    game.feed(game.createState(1), 1),
    1000,
    5 * 60 * 1000,
    templates,
  );
  state = {
    ...state,
    travelId: "t2",
    debugForceForgot: true,
    lastCardTemplateId: "t1",
    collectedCards: [
      {
        id: "old",
        templateId: "t1",
        location: "海边小路",
        journal: "浪一声一声拍过来。",
        collectedAt: 1,
        startedAt: 1,
      },
    ],
  };
  const done = game.tick(state, 1000 + 5 * 60 * 1000, templates);
  const card = done.newCards[0];
  assert.strictEqual(card.kind, "forgot");
  assert.strictEqual(card.templateId, "");
  assert.strictEqual(card.journal, "");
  assert.strictEqual(card.location, "");
  assert.strictEqual(done.state.hasUnreadCard, false);
  assert.strictEqual(done.state.unreadCount, 0);
  assert.ok(!card.unread);
  assert.strictEqual(done.state.lastCardTemplateId, "t1");
  assert.strictEqual(done.state.cardCount, 2);
  assert.strictEqual(game.pickTrip(done.state, templates, "next").id, "t2");
  const restored = game.normalize(
    {
      ...game.toPlayerDoc(done.state),
      collectedCards: done.state.collectedCards,
    },
    1000 + 5 * 60 * 1000,
  );
  assert.strictEqual(restored.lastCardTemplateId, "t1");
  assert.strictEqual(game.pickTrip(restored, templates, "next").id, "t2");
  const again = game.tick(
    { ...state, debugForceForgot: true },
    1000 + 5 * 60 * 1000,
    templates,
  );
  assert.strictEqual(again.newCards[0].id, card.id);

  const doc = cards.cardDoc("user-1", card, 4000);
  assert.strictEqual(doc.kind, "forgot");
  assert.strictEqual(doc.templateId, "");
  assert.strictEqual(doc.unread, false);
});

test("card documents are keyed by user and travel so retries collapse", () => {
  const card = {
    id: "1000:301000:landmark-bund-01",
    templateId: "landmark-bund-01",
    startedAt: 1000,
    collectedAt: 301000,
  };
  const first = cards.cardDoc("user-1", card, 4000);
  const retry = cards.cardDoc("user-1", card, 5000);
  const otherUser = cards.cardDoc("user-2", card, 4000);
  assert.strictEqual(first._id, "user-1_1000:301000:landmark-bund-01");
  assert.strictEqual(retry._id, first._id);
  assert.strictEqual(otherUser._id, "user-2_1000:301000:landmark-bund-01");
  assert.strictEqual(
    cards.cardDocId("user-1", { id: first._id }, 4000),
    first._id,
  );
  assert.strictEqual(first.unread, false);
  assert.strictEqual(
    cards.cardDoc("user-1", { ...card, unread: true }, 4000).unread,
    true,
  );
});

test("coming home while waiting keeps wait for 10s then goes idle", () => {
  let state = far(
    game.applyActivity(game.createState(1), "wait", 1, 2 * game.HOUR_MS),
    1,
  );
  state = { ...state, food: 10, water: 10, emptySince: 0 };
  const result = game.tick(state, 1, templates, { enteringApp: true });
  assert.strictEqual(result.welcomeBack, true);
  assert.strictEqual(result.state.activity, "wait");
  assert.strictEqual(game.getStatusText(result.state), "在等你~");
  assert.strictEqual(result.state.welcomeHoldUntil, 1 + game.WELCOME_HOLD_MS);

  const still = game.tick(
    result.state,
    1 + game.WELCOME_HOLD_MS - 1,
    templates,
  );
  assert.strictEqual(still.state.activity, "wait");

  const done = game.tick(result.state, 1 + game.WELCOME_HOLD_MS, templates);
  assert.strictEqual(done.state.activity, "idle");
  assert.strictEqual(game.getStatusText(done.state), "发呆中...");
  assert.strictEqual(done.state.welcomeHoldUntil, 0);
});

test("coming home while waiting and empty > 3h switches to hungry after 10s", () => {
  const now = 1 + game.EMPTY_HUNGRY_MS + 1000;
  let state = far(
    game.applyActivity(game.createState(1), "wait", 1, 10 * game.HOUR_MS),
    1,
  );
  state = { ...state, food: 0, water: 0, emptySince: 1 };
  const result = game.tick(state, now, templates, { enteringApp: true });
  assert.strictEqual(result.welcomeBack, true);
  assert.strictEqual(result.state.activity, "wait");
  const done = game.tick(result.state, now + game.WELCOME_HOLD_MS, templates);
  assert.strictEqual(done.state.activity, "hungry");
  assert.strictEqual(game.getStatusText(done.state), "等饭中...");
});

test("entering while waiting still welcomes after a trip also finished", () => {
  let state = game.depart(game.feed(game.createState(1), 1), 1000, 1000);
  state = { ...state, activity: "idle" };
  game.setRandom(() => 0.4);
  const result = game.tick(state, 2000, templates, { enteringApp: true });
  assert.strictEqual(result.completed, true);
  assert.strictEqual(result.welcomeBack, true);
  assert.strictEqual(result.state.activity, "wait");
  const done = game.tick(result.state, 2000 + game.WELCOME_HOLD_MS, templates);
  assert.strictEqual(done.state.activity, "idle");
});

test("feeding while hungry after empty > 3h stays put then eats or drinks", () => {
  let state = game.applyActivity(
    game.createState(1),
    "hungry",
    1,
    game.HOUR_MS,
  );
  state = {
    ...state,
    food: 0,
    water: 0,
    emptySince: 1,
  };
  const fedAt = 1 + game.EMPTY_HUNGRY_MS + 1000;
  state = game.feed(state, fedAt);
  assert.strictEqual(state.food, 10);
  assert.strictEqual(state.water, 10);
  assert.strictEqual(state.emptySince, 0);
  assert.strictEqual(state.activity, "hungry");
  assert.strictEqual(state.reliefMealAt, fedAt + game.RELIEF_MEAL_DELAY_MS);
  assert.strictEqual(game.getStatusText(state), "等饭中...");

  const waiting = game.tick(
    state,
    fedAt + game.RELIEF_MEAL_DELAY_MS - 1,
    templates,
  );
  assert.strictEqual(waiting.state.activity, "hungry");
  assert.strictEqual(waiting.state.food, 10);

  game.setRandom(() => 0);
  const eaten = game.tick(state, fedAt + game.RELIEF_MEAL_DELAY_MS, templates);
  assert.strictEqual(eaten.state.activity, "eat");
  assert.strictEqual(eaten.state.food, 10);
  assert.strictEqual(eaten.state.mealTotal, 5);
  assert.strictEqual(eaten.state.water, 10);
  assert.strictEqual(eaten.state.reliefMealAt, 0);
  assert.strictEqual(game.getStatusText(eaten.state), "吃饭中...");
  assert.strictEqual(game.getCatSrc(eaten.state, 0), game.EAT_SRC);
  const eatenDone = game.tick(
    eaten.state,
    eaten.state.activityEndAt,
    templates,
  );
  assert.notStrictEqual(eatenDone.state.activity, "eat");
  assert.strictEqual(eatenDone.state.food, 5);

  game.setRandom(almostOne);
  const drunk = game.tick(state, fedAt + game.RELIEF_MEAL_DELAY_MS, templates);
  assert.strictEqual(drunk.state.activity, "drink");
  assert.strictEqual(drunk.state.water, 10);
  assert.strictEqual(drunk.state.mealTotal, 10);
  assert.strictEqual(drunk.state.food, 10);
  assert.strictEqual(game.getStatusText(drunk.state), "喝水中...");
  assert.strictEqual(game.getCatSrc(drunk.state, 0), game.EAT_SRC);
  assert.strictEqual(
    game.viewModel(drunk.state, drunk.state.activityStartedAt).eating,
    true,
  );
  const drunkDone = game.tick(
    drunk.state,
    drunk.state.activityEndAt,
    templates,
  );
  assert.strictEqual(drunkDone.state.water, 0);
});

test("relief meal after long empty bowls works from sleep and skips travel", () => {
  const fedAt = 1 + game.EMPTY_HUNGRY_MS + 1000;
  let asleep = far(
    game.applyActivity(game.createState(1), "sleep", 1, 10 * game.HOUR_MS),
    1,
  );
  asleep = { ...asleep, food: 0, water: 0, emptySince: 1 };
  asleep = game.feed(asleep, fedAt);
  assert.strictEqual(asleep.activity, "sleep");
  game.setRandom(() => 0);
  const after = game.tick(asleep, fedAt + game.RELIEF_MEAL_DELAY_MS, templates);
  assert.strictEqual(after.state.activity, "eat");

  let trip = game.depart(game.createState(1), 1, 5 * game.MINUTE_MS);
  trip = { ...trip, food: 0, water: 0, emptySince: 1 };
  trip = game.feed(trip, fedAt);
  assert.strictEqual(trip.status, "traveling");
  assert.strictEqual(trip.food, 10);
  assert.ok(!(trip.reliefMealAt > 0));
  assert.strictEqual(trip.status, "traveling");
});

test("feeding before bowls have been empty 3h does not start a relief meal", () => {
  let state = game.applyActivity(
    game.createState(1),
    "hungry",
    1,
    game.HOUR_MS,
  );
  state = { ...state, food: 0, water: 0, emptySince: 1 };
  state = game.feed(state, 1 + game.EMPTY_HUNGRY_MS);
  assert.ok(!(state.reliefMealAt > 0));
  assert.strictEqual(state.activity, "idle");
});

test("eat check has 1/3 chance and consumes 5-10g when food remains", () => {
  let state = far(
    game.applyActivity(
      game.feed(game.createState(1), 1),
      "idle",
      1,
      10 * game.HOUR_MS,
    ),
    1,
  );
  state = {
    ...state,
    food: 20,
    nextEatCheckAt: 5000,
    nextDrinkCheckAt: 1 + 30 * game.DAY_MS,
    nextTravelCheckAt: 1 + 30 * game.DAY_MS,
  };
  game.setRandom(() => 0);
  const eaten = game.tick(state, 5000, templates);
  assert.strictEqual(eaten.state.activity, "eat");
  assert.strictEqual(eaten.state.food, 20);
  assert.strictEqual(eaten.state.mealTotal, game.MEAL_CONSUME_MIN_G);
  assert.strictEqual(eaten.state.mealApplied, 0);
  assert.strictEqual(game.viewModel(eaten.state, 5000).food, 20);
  assert.strictEqual(game.getStatusText(eaten.state), "吃饭中...");
  assert.strictEqual(game.getCatSrc(eaten.state, 0), game.EAT_SRC);

  game.setRandom(() => 0.5);
  const skipped = game.tick(state, 5000, templates);
  assert.strictEqual(skipped.state.activity, "idle");
  assert.strictEqual(skipped.state.food, 20);
});

test("drink check has 1/3 chance and consumes 5-10g when water remains", () => {
  let state = far(
    game.applyActivity(
      game.feed(game.createState(1), 1),
      "idle",
      1,
      10 * game.HOUR_MS,
    ),
    1,
  );
  state = {
    ...state,
    water: 20,
    nextDrinkCheckAt: 5000,
    nextEatCheckAt: 1 + 30 * game.DAY_MS,
    nextTravelCheckAt: 1 + 30 * game.DAY_MS,
  };
  game.setRandom(() => 0);
  const drunk = game.tick(state, 5000, templates);
  assert.strictEqual(drunk.state.activity, "drink");
  assert.strictEqual(drunk.state.water, 20);
  assert.strictEqual(drunk.state.mealTotal, game.MEAL_CONSUME_MIN_G);
  assert.strictEqual(game.getStatusText(drunk.state), "喝水中...");
  assert.strictEqual(game.getCatSrc(drunk.state, 0), game.EAT_SRC);
  assert.strictEqual(game.viewModel(drunk.state, 5000).eating, true);
  const drunkDone = game.tick(
    drunk.state,
    drunk.state.activityEndAt,
    templates,
  );
  assert.strictEqual(drunkDone.state.water, 20 - game.MEAL_CONSUME_MIN_G);
});

test("eat and drink drain one gram at a time across the meal", () => {
  let state = far(
    game.applyActivity(
      game.feed(game.createState(1), 1),
      "idle",
      1,
      10 * game.HOUR_MS,
    ),
    1,
  );
  state = {
    ...state,
    food: 20,
    water: 20,
    nextEatCheckAt: 5000,
    nextDrinkCheckAt: 1 + 30 * game.DAY_MS,
    nextTravelCheckAt: 1 + 30 * game.DAY_MS,
  };
  game.setRandom(() => 0);
  const eaten = game.tick(state, 5000, templates);
  const start = eaten.state.activityStartedAt;
  const end = eaten.state.activityEndAt;
  const total = eaten.state.mealTotal;
  const span = end - start;
  assert.strictEqual(total, game.MEAL_CONSUME_MIN_G);
  assert.ok(span >= 5 * game.MINUTE_MS);
  const firstAt = start + Math.ceil(span / total);
  assert.strictEqual(game.viewModel(eaten.state, firstAt - 1).food, 20);
  assert.strictEqual(game.viewModel(eaten.state, firstAt).food, 19);
  assert.strictEqual(
    game.viewModel(eaten.state, firstAt).foodBowlSrc,
    "/images/food/20.png",
  );
  const mid = start + Math.floor(span / 2);
  const midTick = game.tick(eaten.state, mid, templates);
  assert.strictEqual(midTick.state.activity, "eat");
  assert.strictEqual(midTick.state.food, 18);
  assert.strictEqual(midTick.state.mealApplied, 2);
  assert.strictEqual(game.viewModel(midTick.state, mid).food, 18);
  const done = game.tick(midTick.state, end, templates);
  assert.notStrictEqual(done.state.activity, "eat");
  assert.strictEqual(done.state.food, 20 - total);
  assert.strictEqual(done.state.mealTotal, 0);
  assert.strictEqual(done.state.water, 20);
  const jumped = game.tick(eaten.state, end, templates);
  assert.strictEqual(jumped.state.food, 20 - total);

  const legacy = far(
    game.applyActivity(game.createState(1), "eat", 1000, 60 * 1000),
    1000,
  );
  const legacyDone = game.tick(
    { ...legacy, food: 15, water: 10, emptySince: 0, mealTotal: 0 },
    legacy.activityEndAt,
    templates,
  );
  assert.strictEqual(legacyDone.state.food, 15);
});

test("eat and drink checks do nothing when bowls are empty", () => {
  let state = far(
    game.applyActivity(game.createState(1), "idle", 1, 10 * game.HOUR_MS),
    1,
  );
  state = {
    ...state,
    food: 0,
    water: 0,
    nextEatCheckAt: 2000,
    nextDrinkCheckAt: 1 + 30 * game.DAY_MS,
    nextTravelCheckAt: 1 + 30 * game.DAY_MS,
  };
  game.setRandom(() => 0);
  const result = game.tick(state, 2000, templates);
  assert.strictEqual(result.state.activity, "idle");
  assert.strictEqual(result.state.food, 0);
  assert.ok(result.state.nextEatCheckAt > 2000);
});

test("old pose and decide saves migrate into the new activity field", () => {
  const sleep = game.normalize({ pose: "sleep", food: 0, water: 0 }, 1);
  assert.strictEqual(sleep.activity, "sleep");
  const decide = game.normalize({ activity: "decide", food: 10, water: 10 }, 1);
  assert.strictEqual(decide.activity, "decide");
});

test("long absence catch-up finishes without throwing", () => {
  const result = game.tick(game.createState(1), 1 + 2 * game.DAY_MS, templates);
  assert.ok(result.state);
  assert.ok(result.state.activity);
});

test("album cards sort by the start time shown in the list, not return time", () => {
  const tree = {
    location: "树下",
    startedAt: Date.parse("2026-09-23T20:00:00+08:00"),
    collectedAt: Date.parse("2026-09-24T08:00:00+08:00"),
  };
  const home = {
    location: "回到熟悉的地方",
    startedAt: Date.parse("2026-09-24T03:44:00+08:00"),
    collectedAt: Date.parse("2026-09-24T07:00:00+08:00"),
  };
  const chaka = {
    location: "青海·茶卡盐湖",
    startedAt: Date.parse("2026-09-24T06:40:00+08:00"),
    collectedAt: Date.parse("2026-09-24T07:30:00+08:00"),
  };
  const gulang = {
    location: "福建·鼓浪屿",
    startedAt: Date.parse("2026-09-23T12:05:00+08:00"),
    collectedAt: Date.parse("2026-09-23T18:00:00+08:00"),
  };
  const byReturn = [tree, home, chaka, gulang].sort(
    (a, b) => b.collectedAt - a.collectedAt,
  );
  assert.strictEqual(byReturn[0].location, "树下");
  const sorted = game.sortCardsByListDate([tree, home, chaka, gulang]);
  assert.deepStrictEqual(
    sorted.map((card) => card.location),
    ["青海·茶卡盐湖", "回到熟悉的地方", "树下", "福建·鼓浪屿"],
  );
  const legacy = game.sortCardsByListDate([
    {
      id: "old",
      startedAt: 0,
      collectedAt: Date.parse("2026-09-24T10:00:00+08:00"),
    },
    chaka,
  ]);
  assert.strictEqual(legacy[0].id, "old");
});

test("journal list dates put time first and hide date for today", () => {
  const now = new Date(2026, 9, 12, 16, 0).getTime();
  const today = new Date(2026, 9, 12, 15, 30).getTime();
  const yesterday = new Date(2026, 9, 11, 18, 0).getTime();
  assert.strictEqual(game.formatDateTime(today), "10/12 15:30");
  assert.strictEqual(game.formatListDateTime(today, now), "15:30");
  assert.strictEqual(game.formatListDateTime(yesterday, now), "18:00 10/11");
});

test("review cards cover four photo trips for album audit", () => {
  const now = 1700000000000;
  const cards = reviewCards.buildReviewCards(now);
  assert.strictEqual(cards.length, 4);
  assert.deepStrictEqual(
    cards.map((card) => card.templateId),
    [
      "dali-lake-01",
      "dali-flower-01",
      "xinjiang-poplar-01",
      "landmark-pagoda-01",
    ],
  );
  cards.forEach((card) => {
    assert.ok(card.id.indexOf("review-") === 0);
    assert.ok(card.location);
    assert.ok(card.journal);
    assert.ok(String(card.imageFileID).indexOf("cloud://") === 0);
    assert.ok(card.collectedAt < now);
    assert.ok(card.startedAt < card.journaledAt);
    assert.ok(card.journaledAt <= card.collectedAt);
    assert.strictEqual(
      tripImage.resolveTripImage(card).indexOf("cloud://") === 0,
      true,
    );
  });
  assert.strictEqual(
    reviewCards.withReviewFallback([{ id: "real" }]).length,
    1,
  );
  assert.strictEqual(reviewCards.withReviewFallback([]).length, 4);
});

test("trip image resolver prefers cloud fileID and falls back to mock", () => {
  assert.strictEqual(tripImage.resolveTripImage(null), tripImage.MOCK);
  assert.strictEqual(
    tripImage.resolveTripImage({ image: "/images/trips/mock.png" }),
    tripImage.MOCK,
  );
  assert.strictEqual(
    tripImage.resolveTripImage({
      imageFileID: "cloud://env/trips/dali-flower-01.jpg",
      image: "/images/trips/mock.png",
    }),
    "cloud://env/trips/dali-flower-01.jpg",
  );
  assert.strictEqual(
    tripImage.resolveTripImage({ image: "/images/trips/dali-flower-01.png" }),
    "/images/trips/dali-flower-01.png",
  );
});

test("view model shows feed hint after bowls empty more than 3 hours", () => {
  let state = game.createState(1);
  state = { ...state, food: 0, water: 0, emptySince: 1 };
  assert.strictEqual(game.viewModel(state, 1).showFeedHint, false);
  assert.strictEqual(
    game.viewModel(state, 1 + game.EMPTY_HUNGRY_MS).showFeedHint,
    false,
  );
  assert.strictEqual(
    game.viewModel(state, 1 + game.EMPTY_HUNGRY_MS + 1).showFeedHint,
    true,
  );
  state = game.feed(state, 1 + game.EMPTY_HUNGRY_MS + 1);
  assert.strictEqual(
    game.viewModel(state, 1 + game.EMPTY_HUNGRY_MS + 1).showFeedHint,
    false,
  );
});

test("cat profile trims nickname and locks breed once", () => {
  const fresh = game.normalize({ food: 3 }, 10);
  assert.strictEqual(fresh.nickname, "小咪");
  assert.strictEqual(fresh.breed, "");
  assert.strictEqual(fresh.breedLocked, false);
  assert.strictEqual(
    game.normalize({ nickname: "  小橘子  " }, 1).nickname,
    "小橘子",
  );

  assert.strictEqual(game.sanitizeNickname("  小橘子  "), "小橘子");
  assert.strictEqual(game.sanitizeNickname("   "), "");
  assert.strictEqual(game.nicknameIssue("   "), "empty");
  assert.strictEqual(game.nicknameIssue("一二三四五六七八九十壹"), "long");
  assert.strictEqual(
    game.sanitizeNickname("一二三四五六七八九十"),
    "一二三四五六七八九十",
  );

  const named = game.readProfilePatch({ nickname: "  团子 " }, fresh);
  assert.strictEqual(named.ok, true);
  assert.strictEqual(named.patch.nickname, "团子");
  const withName = game.applyProfile(fresh, named.patch);
  assert.strictEqual(withName.nickname, "团子");
  assert.strictEqual(withName.breedLocked, false);

  const breed = game.readProfilePatch({ breed: "blue-golden" }, withName);
  assert.strictEqual(breed.ok, true);
  const chosen = game.applyProfile(withName, breed.patch);
  assert.strictEqual(chosen.breed, "blue-golden");
  assert.strictEqual(chosen.breedLocked, true);
  assert.strictEqual(chosen.nickname, "团子");

  const again = game.readProfilePatch({ breed: "american" }, chosen);
  assert.strictEqual(again.ok, false);
  assert.strictEqual(again.code, "BREED_LOCKED");
  const renamed = game.readProfilePatch({ nickname: " 豆豆 " }, chosen);
  assert.strictEqual(renamed.ok, true);
  const finalState = game.applyProfile(chosen, renamed.patch);
  assert.strictEqual(finalState.nickname, "豆豆");
  assert.strictEqual(finalState.breed, "blue-golden");
  assert.strictEqual(finalState.breedLocked, true);

  const doc = game.toPlayerDoc(finalState);
  assert.strictEqual(doc.nickname, "豆豆");
  assert.strictEqual(doc.breed, "blue-golden");
  assert.strictEqual(doc.breedLocked, true);
  const round = game.normalize(doc, 20);
  assert.strictEqual(round.nickname, "豆豆");
  assert.strictEqual(round.breed, "blue-golden");
  assert.strictEqual(round.breedLocked, true);

  const ticked = game.tick(finalState, 10);
  assert.strictEqual(ticked.state.nickname, "豆豆");
  assert.strictEqual(ticked.state.breed, "blue-golden");
  assert.strictEqual(ticked.state.breedLocked, true);

  assert.strictEqual(
    game.readProfilePatch({ nickname: "  " }, fresh).code,
    "NICKNAME_INVALID",
  );
  assert.strictEqual(
    game.readProfilePatch({ nickname: "一二三四五六七八九十壹" }, fresh).code,
    "NICKNAME_LONG",
  );
  assert.strictEqual(
    game.readProfilePatch({ breed: "nope" }, fresh).code,
    "BREED_INVALID",
  );
  assert.strictEqual(game.readProfilePatch({}, fresh).code, "EMPTY_PROFILE");
  assert.strictEqual(game.BREEDS[0].name, "美短");
  assert.strictEqual(game.BREEDS[1].name, "蓝金渐层");
  assert.strictEqual(game.BREEDS[1].cardFolder, "travel-cards-lanjin");
  assert.strictEqual(game.BREEDS[1].spriteDir, "/images/cat-lanji");
});

test("breed switches home sprites and travel photo folder", () => {
  const eating = game.applyActivity(game.createState(1), "eat", 1, 60000);
  assert.strictEqual(game.getCatSrc(eating, 1), "/images/cat/eat/001.png");
  assert.strictEqual(
    game.getCatSrc(eating, 1 + game.EAT_FRAME_MS),
    "/images/cat/eat/002.png",
  );
  assert.deepStrictEqual(
    game.viewModel(eating, 1).sleepFrames,
    game.SLEEP_FRAMES,
  );

  const lan = { ...eating, breed: "blue-golden", breedLocked: true };
  assert.strictEqual(game.getCatSrc(lan, 1), "/images/cat-lanji/eat/001.png");
  assert.strictEqual(
    game.getCatSrc(lan, 1 + game.EAT_FRAME_MS),
    "/images/cat-lanji/eat/002.png",
  );
  assert.deepStrictEqual(game.viewModel(lan, 1).eatFrames, [
    "/images/cat-lanji/eat/001.png",
    "/images/cat-lanji/eat/002.png",
  ]);
  const asleep = game.applyActivity(lan, "sleep", 1, 60000);
  assert.strictEqual(
    game.getCatSrc(asleep, 1),
    "/images/cat-lanji/sleep/001.png",
  );
  assert.strictEqual(
    game.getCatSrc(asleep, 1 + game.SLEEP_FRAME_MS),
    "/images/cat-lanji/sleep/002.png",
  );
  assert.strictEqual(
    game.getCatSrc(asleep, 1 + game.SLEEP_FRAME_MS * 2),
    "/images/cat-lanji/sleep/003.png",
  );
  assert.strictEqual(
    game.getCatSrc(asleep, 1 + game.SLEEP_FRAME_MS * 3),
    "/images/cat-lanji/sleep/002.png",
  );
  assert.deepStrictEqual(game.viewModel(asleep, 1).sleepFrames, [
    "/images/cat-lanji/sleep/001.png",
    "/images/cat-lanji/sleep/002.png",
    "/images/cat-lanji/sleep/003.png",
  ]);
  const idle = {
    ...game.applyActivity(lan, "idle", 1, 60000),
    idleArt: 2,
  };
  assert.strictEqual(game.getCatSrc(idle, 1), "/images/cat-lanji/idle/001.png");
  assert.strictEqual(
    game.getCatSrc(idle, 1 + game.IDLE_FRAME_MS),
    "/images/cat-lanji/idle/002.png",
  );
  assert.deepStrictEqual(game.viewModel(idle, 1).idleFrames, [
    "/images/cat-lanji/idle/001.png",
    "/images/cat-lanji/idle/002.png",
  ]);
  const waiting = {
    ...game.applyActivity(lan, "wait", 1, 60000),
    poseVariant: 1,
  };
  assert.strictEqual(game.getCatSrc(waiting, 1), "/images/cat-lanji/wait.png");
  assert.strictEqual(
    game.getCatSrc(waiting, 1 + 1000),
    "/images/cat-lanji/wait.png",
  );
  const deciding = game.applyActivity(lan, "decide", 1, 1000);
  assert.strictEqual(game.getCatSrc(deciding, 1), "/images/cat-lanji/wait.png");

  const file =
    "cloud://cloud1-4grqnt5f5b5d8f20.636c-cloud1-4grqnt5f5b5d8f20-1302940040/travel-cards/dali-lake-01.png";
  const swapped = game.cardImageFileID(file, "blue-golden");
  assert.ok(swapped.indexOf("/travel-cards-lanjin/dali-lake-01.png") > 0);
  assert.strictEqual(swapped.indexOf("/travel-cards/dali-lake"), -1);
  assert.strictEqual(game.cardImageFileID(swapped, "blue-golden"), swapped);
  assert.strictEqual(game.cardImageFileID(swapped, "american"), file);
  assert.strictEqual(game.cardImageFileID(swapped, ""), file);
  assert.strictEqual(
    game.cardImageFileID("cloud://env/trips/dali-flower-01.jpg", "blue-golden"),
    "cloud://env/trips/dali-flower-01.jpg",
  );

  const trip = game.TRIPS.find((item) => item.id === "dali-lake-01");
  const made = game.makeCard(trip, 2000, {
    startedAt: 1000,
    endedAt: 2000,
    breed: "blue-golden",
  });
  assert.ok(
    made.imageFileID.indexOf("/travel-cards-lanjin/dali-lake-01.png") > 0,
  );
  let state = game.feed({ ...game.createState(1), breed: "blue-golden" }, 1);
  state = {
    ...state,
    status: "traveling",
    travelId: trip.id,
    travelStartedAt: 1000,
    travelEndAt: 2000,
    debugForceJournal: true,
  };
  const done = game.tick(state, 2000, game.TRIPS);
  assert.strictEqual(done.newCards[0].templateId, "dali-lake-01");
  assert.ok(done.newCards[0].imageFileID.indexOf("/travel-cards-lanjin/") > 0);
  const normalized = game.normalize(
    {
      breed: "blue-golden",
      breedLocked: true,
      collectedCards: [
        {
          id: "old",
          templateId: "dali-lake-01",
          imageFileID: trip.imageFileID,
          collectedAt: 2000,
          startedAt: 1000,
        },
      ],
    },
    3000,
  );
  assert.ok(
    normalized.collectedCards[0].imageFileID.indexOf(
      "/travel-cards-lanjin/dali-lake-01.png",
    ) > 0,
  );
  const shown = game.presentCard(
    { templateId: "dali-lake-01", imageFileID: trip.imageFileID },
    "blue-golden",
  );
  assert.strictEqual(shown.imageFileID, made.imageFileID);
});

test("tutorial pauses the clock and resumes the same activity", () => {
  const started = game.applyActivity(
    game.createState(1),
    "idle",
    1000,
    60 * 1000,
  );
  const held = game.holdForTutorial(started, 1000);
  assert.strictEqual(held.tutorialDone, false);
  assert.strictEqual(held.activity, "idle");
  assert.strictEqual(held.activityEndAt, started.activityEndAt);

  const later = 1000 + 3 * game.DAY_MS;
  const ticked = game.tick(held, later);
  assert.strictEqual(ticked.state.activity, "idle");
  assert.strictEqual(ticked.state.status, "home");
  assert.strictEqual(ticked.state.tutorialDone, false);
  assert.strictEqual(ticked.newCards.length, 0);
  assert.strictEqual(
    ticked.state.activityEndAt - later,
    started.activityEndAt - 1000,
  );

  const done = game.completeTutorial(ticked.state, later + 5000);
  assert.strictEqual(done.tutorialDone, true);
  assert.strictEqual(done.activity, "idle");
  assert.strictEqual(done.tutorialAnchorAt, 0);
  assert.strictEqual(
    done.activityEndAt - (later + 5000),
    started.activityEndAt - 1000,
  );
  assert.strictEqual(game.toPlayerDoc(done).tutorialDone, true);
  const resumed = game.tick(done, later + 5000);
  assert.strictEqual(resumed.state.activity, "idle");

  const traveling = game.completeTutorial(
    {
      ...held,
      status: "traveling",
      activity: "idle",
      travelId: "t1",
      travelStartedAt: 1000,
      travelEndAt: 9000,
    },
    5000,
  );
  assert.strictEqual(traveling.status, "traveling");
  assert.strictEqual(traveling.activity, "idle");
  assert.strictEqual(traveling.travelId, "t1");
  assert.strictEqual(traveling.travelEndAt, 13000);
});

test("missing tutorialDone is already finished, explicit false still pauses", () => {
  const missing = game.normalize({ food: 1, activity: "idle" }, 10);
  assert.strictEqual(missing.tutorialDone, true);
  assert.strictEqual(game.toPlayerDoc(missing).tutorialDone, true);
  const keptMoving = game.tick(missing, 10 + 1000);
  assert.strictEqual(keptMoving.state.tutorialDone, true);
  assert.strictEqual(keptMoving.state.activity, "idle");

  const fresh = game.normalize(
    { food: 1, activity: "idle", tutorialDone: false },
    10,
  );
  assert.strictEqual(fresh.tutorialDone, false);
  const paused = game.tick(fresh, 10 + 2 * game.DAY_MS);
  assert.strictEqual(paused.state.activity, fresh.activity);
  assert.strictEqual(paused.state.tutorialDone, false);
  const kept = game.normalize(
    { activity: "decide", food: 10, water: 10, tutorialDone: true },
    20,
  );
  assert.strictEqual(kept.tutorialDone, true);
  assert.strictEqual(kept.activity, "decide");
});

test("planters grow on separate timers and harvest persists", () => {
  const start = 1000000;
  game.setRandom(() => 0);
  assert.strictEqual(game.GROW_MIN_MS, 10 * game.MINUTE_MS);
  assert.strictEqual(game.GROW_MAX_MS, 4 * game.HOUR_MS);
  const state = game.createState(start);
  assert.strictEqual(state.leafCount, 0);
  assert.strictEqual(state.planters.length, game.PLANTER_COUNT);
  state.planters.forEach((pot, index) => {
    assert.strictEqual(pot.id, index + 1);
    assert.strictEqual(pot.leaves, 0);
    assert.strictEqual(pot.hint, false);
    assert.strictEqual(pot.nextGrowAt, start + game.GROW_MIN_MS);
  });
  assert.strictEqual(game.planterArt(0), "/images/balcony/planter/00.png");
  assert.strictEqual(game.planterArt(10), "/images/balcony/planter/01.png");
  assert.strictEqual(game.planterArt(20), "/images/balcony/planter/02.png");
  assert.strictEqual(game.planterArt(30), "/images/balcony/planter/03.png");

  const staged = {
    ...state,
    planters: state.planters.map((pot) => ({
      ...pot,
      leaves: pot.id === 3 ? 20 : 0,
      hint: pot.id === 3,
      nextGrowAt: pot.id === 1 ? start + 1000 : start + game.DAY_MS,
    })),
  };
  const grown = game.growPlanters(staged, start + 1000);
  const first = grown.planters.find((pot) => pot.id === 1);
  const third = grown.planters.find((pot) => pot.id === 3);
  assert.strictEqual(first.leaves, 10);
  assert.strictEqual(first.hint, true);
  assert.strictEqual(first.nextGrowAt, start + 1000 + game.GROW_MIN_MS);
  assert.strictEqual(third.leaves, 20);
  assert.strictEqual(third.hint, true);

  const caught = game.growPlanters(state, start + 3 * game.GROW_MIN_MS);
  assert.strictEqual(caught.planters[0].leaves, 30);
  assert.strictEqual(caught.planters[0].hint, true);
  assert.strictEqual(caught.planters[2].leaves, 30);
  assert.strictEqual(
    caught.planters[0].nextGrowAt,
    start + 4 * game.GROW_MIN_MS,
  );
  const capped = game.growPlanters(state, start + 10 * game.GROW_MIN_MS);
  assert.strictEqual(capped.planters[0].leaves, game.LEAF_CAP);
  assert.strictEqual(capped.planters[2].leaves, game.LEAF_CAP);
  assert.strictEqual(
    capped.planters[0].nextGrowAt,
    start + 10 * game.GROW_MIN_MS + game.GROW_MIN_MS,
  );
  const over = game.normalize(
    { planters: [{ id: 1, leaves: 80, nextGrowAt: start + game.DAY_MS, hint: true }] },
    start,
  );
  assert.strictEqual(over.planters[0].leaves, game.LEAF_CAP);

  const harvested = game.harvestPlanter(grown, 3);
  assert.ok(harvested);
  assert.strictEqual(harvested.leafCount, 10);
  const after = harvested.planters.find((pot) => pot.id === 3);
  assert.strictEqual(after.leaves, 10);
  assert.strictEqual(after.hint, true);
  assert.strictEqual(after.nextGrowAt, third.nextGrowAt);
  assert.strictEqual(game.planterArt(after.leaves), "/images/balcony/planter/01.png");
  assert.strictEqual(
    harvested.planters.find((pot) => pot.id === 1).leaves,
    10,
  );
  assert.strictEqual(game.harvestPlanter(harvested, 2), null);
  assert.strictEqual(game.harvestPlanter(harvested, 3).leafCount, 20);
  const cleared = game.harvestPlanter(harvested, 3);
  assert.strictEqual(cleared.planters.find((pot) => pot.id === 3).leaves, 0);
  assert.strictEqual(cleared.planters.find((pot) => pot.id === 3).hint, false);
  assert.strictEqual(game.harvestPlanter(cleared, 3), null);

  const saved = game.normalize(game.toPlayerDoc(harvested), start);
  assert.strictEqual(saved.leafCount, 10);
  assert.strictEqual(saved.planters.find((pot) => pot.id === 3).leaves, 10);
  assert.strictEqual(saved.planters.find((pot) => pot.id === 3).hint, true);
  assert.strictEqual(saved.planters.find((pot) => pot.id === 1).leaves, 10);
  assert.strictEqual(
    saved.planters.find((pot) => pot.id === 1).nextGrowAt,
    first.nextGrowAt,
  );
  const vm = game.viewModel(saved, start);
  assert.strictEqual(vm.leafCount, 10);
  assert.strictEqual(vm.planters[2].hint, true);
  assert.strictEqual(vm.planters[2].src, "/images/balcony/planter/01.png");
  assert.strictEqual(vm.planters[0].hint, true);

  const regrown = game.growPlanters(cleared, start + game.DAY_MS);
  assert.strictEqual(regrown.planters.find((pot) => pot.id === 3).leaves, 10);

  const due = {
    ...state,
    leafCount: 0,
    planters: state.planters.map((pot) => ({
      ...pot,
      leaves: pot.id === 1 ? 20 : 0,
      hint: pot.id === 1,
      nextGrowAt: start - 1000,
    })),
  };
  const grewFirst = game.growPlanters(due, start);
  assert.strictEqual(grewFirst.planters[0].leaves, 30);
  const picked = game.harvestPlanter(due, 1, start, 20);
  assert.strictEqual(picked.planters[0].leaves, 10);
  assert.strictEqual(game.planterArt(picked.planters[0].leaves), "/images/balcony/planter/01.png");
  const held = game.commitHarvest(grewFirst, picked, 1, start);
  assert.strictEqual(held.planters[0].leaves, 10);
  assert.strictEqual(held.leafCount, 10);
  assert.ok(held.planters[0].nextGrowAt > start);
  assert.strictEqual(game.growPlanters(held, start).planters[0].leaves, 10);
  const alreadyGrown = game.harvestPlanter(grewFirst, 1, start, 20);
  assert.strictEqual(alreadyGrown.planters[0].leaves, 10);
  assert.strictEqual(
    game.commitHarvest(grewFirst, alreadyGrown, 1, start).planters[0].leaves,
    10
  );
  assert.strictEqual(regrown.planters.find((pot) => pot.id === 3).hint, true);

  const legacy = game.normalize({ food: 1, activity: "idle" }, start);
  assert.strictEqual(legacy.planters.length, 3);
  assert.strictEqual(legacy.planters[0].leaves, 0);
  assert.strictEqual(legacy.leafCount, 0);
  assert.ok(legacy.planters[0].nextGrowAt > start);
  assert.ok(legacy.planters[1].nextGrowAt > start);

  const wiped = game.normalize(
    {
      leafCount: 80,
      planters: [
        { id: 1, leaves: 20, nextGrowAt: start + game.DAY_MS, hint: true },
      ],
    },
    start,
  );
  assert.strictEqual(wiped.leafCount, 0);
  assert.strictEqual(wiped.planters[0].leaves, 20);
  assert.strictEqual(wiped.leafStockEpoch, game.LEAF_STOCK_EPOCH);
  const kept = game.normalize(
    game.toPlayerDoc({ ...wiped, leafCount: 30 }),
    start,
  );
  assert.strictEqual(kept.leafCount, 30);
});

test("forgot journal copy is picked from the library and stable per trip", () => {
  assert.ok(backText.length > 1);
  const first = pickBackText("1000:301000:forgot");
  assert.ok(backText.includes(first));
  assert.strictEqual(pickBackText("1000:301000:forgot"), first);
  const seen = new Set();
  for (let i = 0; i < 40; i++) seen.add(pickBackText(i + ":forgot"));
  assert.ok(seen.size > 1);
});

console.log("\n" + passed + " tests passed");
