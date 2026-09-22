const assert = require('assert');
const game = require('../miniprogram/utils/game.js');
const tripImage = require('../miniprogram/utils/tripImage.js');
const reviewCards = require('../miniprogram/data/review-cards.js');

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

const templates = [
  {
    id: 't1',
    location: '海边小路',
    image: '',
    journal: '浪一声一声拍过来。',
  },
  {
    id: 't2',
    location: '老巷子',
    image: '',
    journal: '路灯先亮了我的胡须。',
  },
];

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log('ok', name);
  } finally {
    game.setRandom();
  }
}

test('initial home is hungry and can feed', () => {
  const state = game.createState(1);
  assert.strictEqual(state.food, 0);
  assert.strictEqual(state.water, 0);
  assert.strictEqual(state.status, 'home');
  assert.strictEqual(game.canFeed(state), true);
  assert.ok(['sleep', 'idle', 'decide'].indexOf(state.activity) >= 0);
  const vm = game.viewModel(state, 1);
  assert.ok(vm.foodBowlSrc.indexOf('empty') >= 0);
  assert.ok(vm.waterBowlSrc.indexOf('empty') >= 0);
});

test('feed adds 10g each tap up to 50g', () => {
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

test('idle art is random among five poses and ignores food', () => {
  const seen = {};
  for (let i = 0; i < game.IDLE_ARTS.length; i++) {
    game.setRandom(() => i / game.IDLE_ARTS.length);
    const state = game.applyActivity(game.createState(1), 'idle', 1, 1000);
    seen[game.getCatSrc(state)] = true;
  }
  game.IDLE_ARTS.forEach((src) => {
    assert.strictEqual(seen[src], true);
  });

  let state = game.applyActivity(game.createState(1), 'idle', 1, 1000);
  state = { ...state, idleArt: 0, food: 0, water: 0 };
  assert.strictEqual(game.getCatSrc(state), '/images/cat/lie-1.png');
  state = game.feed(state, 1);
  assert.strictEqual(game.getCatSrc(state), '/images/cat/lie-1.png');
  assert.strictEqual(state.food, 10);
  state = { ...state, idleArt: 3 };
  assert.strictEqual(game.getCatSrc(state), '/images/cat/stand-bag.png');
  const loaded = roundtrip(state);
  assert.strictEqual(loaded.idleArt, 3);
  assert.strictEqual(game.getCatSrc(loaded), '/images/cat/stand-bag.png');

  const legacyStand = game.normalize({
    activity: 'idle',
    idleKind: 'stand',
    poseVariant: 0,
    food: 0,
    water: 0,
  }, 1);
  assert.strictEqual(game.getCatSrc(legacyStand), '/images/cat/stand.png');
});

test('idle art can switch while still idle and never repeats immediately', () => {
  game.setRandom(() => 0);
  let state = game.applyActivity(game.createState(1), 'idle', 1000, 20 * game.MINUTE_MS);
  state = {
    ...state,
    idleArt: 0,
    nextIdleArtAt: 1000 + game.IDLE_ART_MIN_MS,
    nextDrinkCheckAt: 1000 + 30 * game.DAY_MS,
    nextEatCheckAt: 1000 + 30 * game.DAY_MS,
  };
  assert.strictEqual(game.getCatSrc(state), '/images/cat/lie-1.png');
  const waiting = game.tick(state, 1000 + game.IDLE_ART_MIN_MS - 1, templates);
  assert.strictEqual(waiting.changed, false);
  assert.strictEqual(waiting.state.idleArt, 0);
  assert.strictEqual(waiting.state.activity, 'idle');

  const swapped = game.tick(state, 1000 + game.IDLE_ART_MIN_MS, templates);
  assert.strictEqual(swapped.changed, true);
  assert.strictEqual(swapped.state.activity, 'idle');
  assert.notStrictEqual(swapped.state.idleArt, 0);
  assert.ok(swapped.state.nextIdleArtAt > 1000 + game.IDLE_ART_MIN_MS);
  assert.strictEqual(game.getCatSrc(swapped.state), game.IDLE_ARTS[swapped.state.idleArt]);

  let current = swapped.state;
  for (let i = 0; i < 20; i++) {
    const prev = current.idleArt;
    game.setRandom(() => (i % 2 === 0 ? 0 : almostOne()));
    const next = game.tick(
      {
        ...current,
        nextDrinkCheckAt: current.nextIdleArtAt + 30 * game.DAY_MS,
        nextEatCheckAt: current.nextIdleArtAt + 30 * game.DAY_MS,
        activityEndAt: current.nextIdleArtAt + 30 * game.DAY_MS,
      },
      current.nextIdleArtAt,
      templates
    );
    assert.strictEqual(next.state.activity, 'idle');
    assert.notStrictEqual(next.state.idleArt, prev);
    current = next.state;
  }
});

test('sleep frames and wait use dedicated art', () => {
  let state = game.applyActivity(game.createState(1), 'idle', 1, 1000);
  state = game.applyActivity(state, 'sleep', 1, game.SLEEP_MIN_MS);
  const sleepStart = state.activityStartedAt;
  assert.strictEqual(game.SLEEP_FRAME_MS, 1000);
  assert.ok(game.getCatSrc(state, sleepStart).indexOf('sleep/001') >= 0);
  assert.ok(game.getCatSrc(state, sleepStart + game.SLEEP_FRAME_MS).indexOf('sleep/002') >= 0);
  assert.ok(game.getCatSrc(state, sleepStart + game.SLEEP_FRAME_MS * 2).indexOf('sleep/003') >= 0);
  assert.ok(game.getCatSrc(state, sleepStart + game.SLEEP_FRAME_MS * 3).indexOf('sleep/002') >= 0);
  assert.ok(game.getCatSrc(state, sleepStart + game.SLEEP_FRAME_MS * 4).indexOf('sleep/001') >= 0);
  assert.strictEqual(game.getStatusText(state), '睡觉中...');
  const sleepVm = game.viewModel(state, 0);
  assert.strictEqual(sleepVm.sleeping, true);
  assert.strictEqual(sleepVm.sleepFrames.length, 3);
  assert.strictEqual(sleepVm.eating, false);
  state = game.applyActivity(state, 'wait', 1, 1000);
  assert.ok(game.getCatSrc(state).indexOf('wait-') >= 0);
  assert.ok(game.getStatusText(state).indexOf('在等你') >= 0);
  assert.strictEqual(game.viewModel(state, 1).catPlace, 'cat-door');
  assert.strictEqual(game.viewModel(state, 1).showBag, false);
});

test('decide shows bag to the left of the door cat', () => {
  let state = game.applyActivity(game.createState(1), 'decide', 1);
  const decideVm = game.viewModel(state, 1);
  assert.strictEqual(decideVm.catPlace, 'cat-door');
  assert.strictEqual(decideVm.showBag, true);
  state = game.applyActivity(state, 'wait', 1);
  assert.strictEqual(game.viewModel(state, 1).showBag, false);
  state = game.applyActivity(state, 'idle', 1);
  assert.strictEqual(game.viewModel(state, 1).showBag, false);
});

test('eat frames loop like sleep', () => {
  let state = game.applyActivity(game.createState(1), 'eat', 1, game.MINUTE_MS);
  const eatStart = state.activityStartedAt;
  assert.strictEqual(game.EAT_FRAME_MS, 1000);
  assert.ok(game.getCatSrc(state, eatStart).indexOf('eat/001') >= 0);
  assert.ok(game.getCatSrc(state, eatStart + game.EAT_FRAME_MS).indexOf('eat/002') >= 0);
  assert.ok(game.getCatSrc(state, eatStart + game.EAT_FRAME_MS * 2).indexOf('eat/003') >= 0);
  assert.ok(game.getCatSrc(state, eatStart + game.EAT_FRAME_MS * 3).indexOf('eat/002') >= 0);
  assert.ok(game.getCatSrc(state, eatStart + game.EAT_FRAME_MS * 4).indexOf('eat/001') >= 0);
  assert.strictEqual(game.getStatusText(state), '吃饭中...');
  const eatVm = game.viewModel(state, 0);
  assert.strictEqual(eatVm.eating, true);
  assert.strictEqual(eatVm.sleeping, false);
  assert.strictEqual(eatVm.eatFrames.length, 3);
  assert.strictEqual(eatVm.catPlace, 'cat-near');
  assert.strictEqual(game.usesLoopFrames(state), true);
});

test('sleep uses 5min-30min range and can be driven by explicit duration', () => {
  assert.strictEqual(game.SLEEP_MIN_MS, 5 * game.MINUTE_MS);
  assert.strictEqual(game.SLEEP_MAX_MS, 30 * game.MINUTE_MS);
  game.setRandom(() => 0);
  let state = game.applyActivity(game.createState(1), 'sleep', 1000);
  assert.strictEqual(state.activityEndAt - 1000, game.SLEEP_MIN_MS);
  game.setRandom(almostOne);
  state = game.applyActivity(game.createState(1), 'sleep', 1000);
  assert.strictEqual(state.activityEndAt - 1000, game.SLEEP_MAX_MS);

  state = far(game.applyActivity(game.createState(1), 'sleep', 1000, 5 * 60 * 1000), 1000);
  const mid = game.tick(state, 1000 + 5 * 60 * 1000 - 1, templates);
  assert.strictEqual(mid.changed, false);
  assert.strictEqual(mid.state.activity, 'sleep');
  const done = game.tick(state, 1000 + 5 * 60 * 1000, templates);
  assert.strictEqual(done.changed, true);
  assert.notStrictEqual(done.state.activity, 'sleep');
});

test('idle and wait durations follow the new ranges', () => {
  assert.strictEqual(game.IDLE_MIN_MS, 2 * game.MINUTE_MS);
  assert.strictEqual(game.IDLE_MAX_MS, 10 * game.MINUTE_MS);
  game.setRandom(() => 0);
  let state = game.applyActivity(game.createState(1), 'idle', 1);
  assert.strictEqual(state.activityEndAt - 1, game.IDLE_MIN_MS);
  state = game.applyActivity(state, 'wait', 1);
  assert.strictEqual(state.activityEndAt - 1, game.WAIT_MIN_MS);
  game.setRandom(almostOne);
  state = game.applyActivity(state, 'idle', 1);
  assert.strictEqual(state.activityEndAt - 1, game.IDLE_MAX_MS);
  state = game.applyActivity(state, 'wait', 1);
  assert.strictEqual(state.activityEndAt - 1, game.WAIT_MAX_MS);
});

test('next home activity never repeats the current one', () => {
  for (let i = 0; i < 40; i++) {
    const next = game.pickNextActivity({
      activity: 'wait',
      food: 10,
      water: 10,
      emptySince: 0,
    }, 1);
    assert.notStrictEqual(next, 'wait');
    assert.ok(['sleep', 'idle', 'decide'].indexOf(next) >= 0);
  }
  const later = 1 + game.EMPTY_HUNGRY_MS + 1;
  for (let i = 0; i < 40; i++) {
    const next = game.pickNextActivity({
      activity: 'idle',
      food: 0,
      water: 0,
      emptySince: 1,
    }, later, { online: false });
    assert.notStrictEqual(next, 'idle');
    assert.ok(['sleep', 'wait', 'decide', 'hungry'].indexOf(next) >= 0);
  }
});

test('online rotation never picks wait', () => {
  const seen = {};
  for (let i = 0; i < 40; i++) {
    const next = game.pickNextActivity({
      activity: 'idle',
      food: 10,
      water: 10,
      emptySince: 0,
    }, 1);
    assert.notStrictEqual(next, 'wait');
    assert.ok(['sleep', 'idle', 'decide'].indexOf(next) >= 0);
    seen[next] = true;
  }
  assert.ok(seen.sleep || seen.decide);
  let state = far(game.applyActivity(game.createState(1), 'idle', 1, 1000), 1);
  state = { ...state, food: 10, water: 10, emptySince: 0 };
  game.setRandom(() => 0.9);
  const result = game.tick(state, 1000, templates);
  assert.notStrictEqual(result.state.activity, 'wait');
});

test('offline rotation can pick wait', () => {
  const seen = {};
  for (let i = 0; i < 80; i++) {
    const next = game.pickNextActivity({
      activity: 'idle',
      food: 10,
      water: 10,
      emptySince: 0,
    }, 1, { online: false });
    seen[next] = true;
  }
  assert.strictEqual(seen.wait, true);
  assert.strictEqual(seen.decide, true);
});

test('decide duration is 12-25s and can travel or stay', () => {
  game.setRandom(() => 0);
  let state = game.applyActivity(game.createState(1), 'decide', 1);
  assert.strictEqual(state.activityEndAt - 1, game.DECIDE_MIN_MS);
  game.setRandom(almostOne);
  state = game.applyActivity(state, 'decide', 1);
  assert.strictEqual(state.activityEndAt - 1, game.DECIDE_MAX_MS);
  assert.strictEqual(game.getStatusText(state), '要出门吗...');
  assert.ok(game.getCatSrc(state).indexOf('wait-') >= 0);

  state = far(game.applyActivity(game.createState(1), 'decide', 1, 1000), 1);
  state = { ...state, food: 10, water: 10, emptySince: 0 };
  game.setRandom(() => 0);
  const gone = game.tick(state, 1001, templates);
  assert.strictEqual(gone.state.status, 'traveling');

  game.setRandom(almostOne);
  const stayed = game.tick(state, 1001, templates);
  assert.notStrictEqual(stayed.state.status, 'traveling');
  assert.notStrictEqual(stayed.state.activity, 'decide');
});

test('depart plans duration by supply band and caps at 48h', () => {
  assert.strictEqual(game.LOW_TRAVEL_MIN_MS, 30 * game.MINUTE_MS);
  assert.strictEqual(game.MID_TRAVEL_MIN_MS, game.HOUR_MS);
  assert.strictEqual(game.HIGH_TRAVEL_MIN_MS, 2 * game.HOUR_MS);
  game.setRandom(() => 0);
  let low = game.depart(game.createState(1), 1000);
  assert.strictEqual(low.status, 'traveling');
  assert.strictEqual(low.food, 0);
  assert.strictEqual(low.water, 0);
  assert.strictEqual(low.travelEndAt - 1000, game.LOW_TRAVEL_MIN_MS);
  assert.ok(low.travelId);
  assert.strictEqual(low.activityStartedAt != null ? true : false, true);
  assert.ok(low.nextTravelCheckAt >= low.travelEndAt + game.MINUTE_MS);

  let mid = game.feed(game.createState(1), 1);
  mid = game.depart(mid, 1000);
  assert.strictEqual(mid.travelEndAt - 1000, game.MID_TRAVEL_MIN_MS);
  assert.strictEqual(mid.food, 10);
  assert.strictEqual(mid.water, 10);

  let high = { ...game.feed(game.createState(1), 1), food: 20, water: 20 };
  high = game.depart(high, 1000);
  assert.strictEqual(high.travelEndAt - 1000, game.HIGH_TRAVEL_MIN_MS);

  const capped = game.depart(game.feed(game.createState(1), 1), 1000, game.TRAVEL_MAX_MS + 9999);
  assert.strictEqual(capped.travelEndAt - 1000, game.TRAVEL_MAX_MS);
});

test('travel consume table matches duration and stock', () => {
  const low = { food: 6, water: 4 };
  assert.deepStrictEqual(game.travelCost('low', game.HOUR_MS, low), { food: 6, water: 4 });
  assert.deepStrictEqual(game.travelCost('mid', 6 * game.HOUR_MS, {}), { food: 0, water: 0 });
  assert.deepStrictEqual(game.travelCost('mid', 6 * game.HOUR_MS + 1, {}), { food: 10, water: 10 });
  assert.deepStrictEqual(game.travelCost('high', 12 * game.HOUR_MS + 1, {}), { food: 20, water: 10 });
  assert.deepStrictEqual(game.travelCost('high', 7 * game.HOUR_MS, {}), { food: 10, water: 10 });

  let state = { ...game.feed(game.createState(1), 1), food: 20, water: 20 };
  state = game.depart(state, 1000, 13 * game.HOUR_MS);
  assert.strictEqual(state.food, 0);
  assert.strictEqual(state.water, 10);
});

test('low supply can still depart through decide', () => {
  let state = far(game.applyActivity(game.createState(1), 'decide', 1, 1000), 1);
  game.setRandom(() => 0);
  const gone = game.tick(state, 1001, templates);
  assert.strictEqual(gone.state.status, 'traveling');
  assert.strictEqual(gone.state.food, 0);
  assert.strictEqual(gone.state.water, 0);
});

test('travel UI shows remaining time and elapsed minutes', () => {
  let state = game.depart(game.feed(game.createState(1), 1), 1000, 5 * 60 * 1000);
  const vm = game.viewModel(state, 1000);
  assert.strictEqual(vm.traveling, true);
  assert.strictEqual(vm.catSrc, '');
  assert.strictEqual(vm.showBag, false);
  assert.ok(vm.statusText.indexOf('旅行中') >= 0);
  assert.strictEqual(vm.remainText, '5:00');
  assert.strictEqual(vm.statusRemainText, '5:00');
  assert.strictEqual(vm.awayText, '已出门 0 分钟');
  assert.strictEqual(game.viewModel(state, 1000 + 60 * 1000).awayText, '已出门 1 分钟');
  assert.strictEqual(game.formatRemain(game.HOUR_MS), '1:00:00');
});

test('home status remaining time follows activityEndAt', () => {
  const state = game.applyActivity(game.createState(1), 'idle', 1000, 90 * 1000);
  assert.strictEqual(game.statusRemainMs(state, 1000), 90 * 1000);
  assert.strictEqual(game.viewModel(state, 1000).statusRemainText, '1:30');
  assert.strictEqual(game.viewModel(state, 1000 + 30 * 1000).statusRemainText, '1:00');
});

test('travel stays in progress until duration ends', () => {
  let state = game.depart(game.feed(game.createState(1), 1), 1000, 5 * 60 * 1000);
  const mid = game.tick(state, 1000 + 5 * 60 * 1000 - 1, templates);
  assert.strictEqual(mid.completed, false);
  assert.strictEqual(mid.state.status, 'traveling');
  assert.strictEqual(game.formatRemain(mid.remainMs), '0:01');
});

test('travel complete creates a first-person card and unread dot', () => {
  let state = game.depart(game.feed(game.createState(1), 1), 1000, 5 * 60 * 1000);
  const done = game.tick(state, 1000 + 5 * 60 * 1000, templates);
  assert.strictEqual(done.completed, true);
  assert.strictEqual(done.state.status, 'home');
  assert.strictEqual(done.state.hasUnreadCard, true);
  assert.strictEqual(done.state.collectedCards.length, 1);
  assert.strictEqual(done.newCards.length, 1);
  const card = done.state.collectedCards[0];
  assert.strictEqual(done.newCards[0].id, card.id);
  assert.ok(card.location);
  assert.ok(card.journal);
  assert.ok(templates.some((item) => item.id === card.templateId));
  assert.strictEqual(done.state.travelId, '');
  assert.strictEqual(done.state.lastCardTemplateId, card.templateId);
  assert.strictEqual(done.state.cardCount, 1);
  assert.ok(!game.toPlayerDoc(done.state).collectedCards);
  assert.strictEqual(done.state.travelEndAt, 0);
  assert.strictEqual(card.startedAt, 1000);
  assert.ok(card.journaledAt >= 1000);
  assert.ok(card.journaledAt < 1000 + 5 * 60 * 1000);
});

test('old cards get start and in-trip times without changing later', () => {
  const collectedAt = 1000000;
  const loaded = game.normalize({
    collectedCards: [{
      id: 'old-1',
      templateId: 't1',
      location: '海边小路',
      image: '',
      journal: '浪一声一声拍过来。',
      collectedAt,
    }],
  }, collectedAt);
  const card = loaded.collectedCards[0];
  assert.strictEqual(card.startedAt, collectedAt - game.TRAVEL_DURATION_MS);
  assert.ok(card.journaledAt >= card.startedAt);
  assert.ok(card.journaledAt < collectedAt);
  const again = game.normalize(loaded, collectedAt).collectedCards[0];
  assert.strictEqual(again.journaledAt, card.journaledAt);
});

test('closing and reopening restores unfinished travel', () => {
  let state = game.depart(game.feed(game.createState(1), 1), 1000, 5 * 60 * 1000);
  const loaded = roundtrip(state);
  assert.strictEqual(loaded.status, 'traveling');
  assert.strictEqual(loaded.travelEndAt, state.travelEndAt);
  const still = game.tick(loaded, 1000 + 60 * 1000, templates);
  assert.strictEqual(still.completed, false);
});

test('reopening after travel ended generates card and unread reminder', () => {
  let state = game.depart(game.feed(game.createState(1), 1), 1000, 5 * 60 * 1000);
  const loaded = roundtrip(state);
  const done = game.tick(loaded, 1000 + 5 * 60 * 1000 + 5000, templates);
  assert.strictEqual(done.completed, true);
  assert.strictEqual(done.state.hasUnreadCard, true);
  assert.strictEqual(done.state.collectedCards.length, 1);
  const cleared = game.clearUnread(done.state);
  assert.strictEqual(cleared.hasUnreadCard, false);
  assert.strictEqual(cleared.collectedCards.length, 1);
});

test('second trip works after feeding again', () => {
  let state = game.depart(game.feed(game.createState(1), 1), 1000, 5 * 60 * 1000);
  state = game.tick(state, 1000 + 5 * 60 * 1000, templates).state;
  state = game.feed(state, 200000);
  state = game.depart(state, 200000, 5 * 60 * 1000);
  const second = game.tick(state, 200000 + 5 * 60 * 1000, templates);
  assert.strictEqual(second.state.collectedCards.length, 2);
  assert.strictEqual(second.newCards.length, 1);
  assert.strictEqual(second.state.cardCount, 2);
});

test('depart locks travelId and completeTravel does not reroll it', () => {
  let state = game.depart(game.feed(game.createState(1), 1), 1000, 5 * 60 * 1000, templates);
  assert.ok(templates.some((item) => item.id === state.travelId));
  const locked = state.travelId;
  const done = game.tick(state, 1000 + 5 * 60 * 1000, templates);
  assert.strictEqual(done.newCards[0].templateId, locked);
});

test('coming home while waiting keeps wait for 10s then goes idle', () => {
  let state = far(game.applyActivity(game.createState(1), 'wait', 1, 2 * game.HOUR_MS), 1);
  state = { ...state, food: 10, water: 10, emptySince: 0 };
  const result = game.tick(state, 1, templates, { enteringApp: true });
  assert.strictEqual(result.welcomeBack, true);
  assert.strictEqual(result.state.activity, 'wait');
  assert.strictEqual(game.getStatusText(result.state), '在等你~');
  assert.strictEqual(result.state.welcomeHoldUntil, 1 + game.WELCOME_HOLD_MS);

  const still = game.tick(result.state, 1 + game.WELCOME_HOLD_MS - 1, templates);
  assert.strictEqual(still.state.activity, 'wait');

  const done = game.tick(result.state, 1 + game.WELCOME_HOLD_MS, templates);
  assert.strictEqual(done.state.activity, 'idle');
  assert.strictEqual(game.getStatusText(done.state), '发呆中...');
  assert.strictEqual(done.state.welcomeHoldUntil, 0);
});

test('coming home while waiting and empty > 3h switches to hungry after 10s', () => {
  const now = 1 + game.EMPTY_HUNGRY_MS + 1000;
  let state = far(game.applyActivity(game.createState(1), 'wait', 1, 10 * game.HOUR_MS), 1);
  state = { ...state, food: 0, water: 0, emptySince: 1 };
  const result = game.tick(state, now, templates, { enteringApp: true });
  assert.strictEqual(result.welcomeBack, true);
  assert.strictEqual(result.state.activity, 'wait');
  const done = game.tick(result.state, now + game.WELCOME_HOLD_MS, templates);
  assert.strictEqual(done.state.activity, 'hungry');
  assert.strictEqual(game.getStatusText(done.state), '等饭中...');
});

test('entering while waiting still welcomes after a trip also finished', () => {
  let state = game.depart(game.feed(game.createState(1), 1), 1000, 1000);
  state = { ...state, activity: 'idle' };
  game.setRandom(() => 0.4);
  const result = game.tick(state, 2000, templates, { enteringApp: true });
  assert.strictEqual(result.completed, true);
  assert.strictEqual(result.welcomeBack, true);
  assert.strictEqual(result.state.activity, 'wait');
  const done = game.tick(result.state, 2000 + game.WELCOME_HOLD_MS, templates);
  assert.strictEqual(done.state.activity, 'idle');
});

test('feeding while hungry after empty > 3h stays put then eats or drinks', () => {
  let state = game.applyActivity(game.createState(1), 'hungry', 1, game.HOUR_MS);
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
  assert.strictEqual(state.activity, 'hungry');
  assert.strictEqual(state.reliefMealAt, fedAt + game.RELIEF_MEAL_DELAY_MS);
  assert.strictEqual(game.getStatusText(state), '等饭中...');

  const waiting = game.tick(state, fedAt + game.RELIEF_MEAL_DELAY_MS - 1, templates);
  assert.strictEqual(waiting.state.activity, 'hungry');
  assert.strictEqual(waiting.state.food, 10);

  game.setRandom(() => 0);
  const eaten = game.tick(state, fedAt + game.RELIEF_MEAL_DELAY_MS, templates);
  assert.strictEqual(eaten.state.activity, 'eat');
  assert.strictEqual(eaten.state.food, 5);
  assert.strictEqual(eaten.state.water, 10);
  assert.strictEqual(eaten.state.reliefMealAt, 0);
  assert.strictEqual(game.getStatusText(eaten.state), '吃饭中...');
  assert.ok(game.getCatSrc(eaten.state, 0).indexOf('eat/001') >= 0);

  game.setRandom(almostOne);
  const drunk = game.tick(state, fedAt + game.RELIEF_MEAL_DELAY_MS, templates);
  assert.strictEqual(drunk.state.activity, 'drink');
  assert.strictEqual(drunk.state.water, 0);
  assert.strictEqual(drunk.state.food, 10);
  assert.strictEqual(game.getStatusText(drunk.state), '喝水中...');
});

test('relief meal after long empty bowls works from sleep and skips travel', () => {
  const fedAt = 1 + game.EMPTY_HUNGRY_MS + 1000;
  let asleep = far(game.applyActivity(game.createState(1), 'sleep', 1, 10 * game.HOUR_MS), 1);
  asleep = { ...asleep, food: 0, water: 0, emptySince: 1 };
  asleep = game.feed(asleep, fedAt);
  assert.strictEqual(asleep.activity, 'sleep');
  game.setRandom(() => 0);
  const after = game.tick(asleep, fedAt + game.RELIEF_MEAL_DELAY_MS, templates);
  assert.strictEqual(after.state.activity, 'eat');

  let trip = game.depart(game.createState(1), 1, 5 * game.MINUTE_MS);
  trip = { ...trip, food: 0, water: 0, emptySince: 1 };
  trip = game.feed(trip, fedAt);
  assert.strictEqual(trip.status, 'traveling');
  assert.strictEqual(trip.food, 10);
  assert.ok(!(trip.reliefMealAt > 0));
  assert.strictEqual(trip.status, 'traveling');
});

test('feeding before bowls have been empty 3h does not start a relief meal', () => {
  let state = game.applyActivity(game.createState(1), 'hungry', 1, game.HOUR_MS);
  state = { ...state, food: 0, water: 0, emptySince: 1 };
  state = game.feed(state, 1 + game.EMPTY_HUNGRY_MS);
  assert.ok(!(state.reliefMealAt > 0));
  assert.strictEqual(state.activity, 'idle');
});

test('eat check has 1/3 chance and consumes 5-10g when food remains', () => {
  let state = far(game.applyActivity(game.feed(game.createState(1), 1), 'idle', 1, 10 * game.HOUR_MS), 1);
  state = {
    ...state,
    food: 20,
    nextEatCheckAt: 5000,
    nextDrinkCheckAt: 1 + 30 * game.DAY_MS,
    nextTravelCheckAt: 1 + 30 * game.DAY_MS,
  };
  game.setRandom(() => 0);
  const eaten = game.tick(state, 5000, templates);
  assert.strictEqual(eaten.state.activity, 'eat');
  assert.strictEqual(eaten.state.food, 20 - game.MEAL_CONSUME_MIN_G);
  assert.strictEqual(game.getStatusText(eaten.state), '吃饭中...');
  assert.ok(game.getCatSrc(eaten.state, 0).indexOf('eat/001') >= 0);

  game.setRandom(() => 0.5);
  const skipped = game.tick(state, 5000, templates);
  assert.strictEqual(skipped.state.activity, 'idle');
  assert.strictEqual(skipped.state.food, 20);
});

test('drink check has 1/3 chance and consumes 5-10g when water remains', () => {
  let state = far(game.applyActivity(game.feed(game.createState(1), 1), 'idle', 1, 10 * game.HOUR_MS), 1);
  state = {
    ...state,
    water: 20,
    nextDrinkCheckAt: 5000,
    nextEatCheckAt: 1 + 30 * game.DAY_MS,
    nextTravelCheckAt: 1 + 30 * game.DAY_MS,
  };
  game.setRandom(() => 0);
  const drunk = game.tick(state, 5000, templates);
  assert.strictEqual(drunk.state.activity, 'drink');
  assert.strictEqual(drunk.state.water, 20 - game.MEAL_CONSUME_MIN_G);
  assert.strictEqual(game.getStatusText(drunk.state), '喝水中...');
});

test('eat and drink checks do nothing when bowls are empty', () => {
  let state = far(game.applyActivity(game.createState(1), 'idle', 1, 10 * game.HOUR_MS), 1);
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
  assert.strictEqual(result.state.activity, 'idle');
  assert.strictEqual(result.state.food, 0);
  assert.ok(result.state.nextEatCheckAt > 2000);
});

test('old pose and decide saves migrate into the new activity field', () => {
  const sleep = game.normalize({ pose: 'sleep', food: 0, water: 0 }, 1);
  assert.strictEqual(sleep.activity, 'sleep');
  const decide = game.normalize({ activity: 'decide', food: 10, water: 10 }, 1);
  assert.strictEqual(decide.activity, 'decide');
});

test('long absence catch-up finishes without throwing', () => {
  const result = game.tick(game.createState(1), 1 + 2 * game.DAY_MS, templates);
  assert.ok(result.state);
  assert.ok(result.state.activity);
});

test('review cards cover four photo trips for album audit', () => {
  const now = 1700000000000;
  const cards = reviewCards.buildReviewCards(now);
  assert.strictEqual(cards.length, 4);
  assert.deepStrictEqual(
    cards.map((card) => card.templateId),
    [
      'dali-lake-01',
      'dali-flower-01',
      'xinjiang-poplar-01',
      'landmark-pagoda-01',
    ]
  );
  cards.forEach((card) => {
    assert.ok(card.id.indexOf('review-') === 0);
    assert.ok(card.location);
    assert.ok(card.journal);
    assert.ok(String(card.imageFileID).indexOf('cloud://') === 0);
    assert.ok(card.collectedAt < now);
    assert.ok(card.startedAt < card.journaledAt);
    assert.ok(card.journaledAt <= card.collectedAt);
    assert.strictEqual(
      tripImage.resolveTripImage(card).indexOf('cloud://') === 0,
      true
    );
  });
  assert.strictEqual(reviewCards.withReviewFallback([{ id: 'real' }]).length, 1);
  assert.strictEqual(reviewCards.withReviewFallback([]).length, 4);
});

test('trip image resolver prefers cloud fileID and falls back to mock', () => {
  assert.strictEqual(tripImage.resolveTripImage(null), tripImage.MOCK);
  assert.strictEqual(
    tripImage.resolveTripImage({ image: '/images/trips/mock.png' }),
    tripImage.MOCK
  );
  assert.strictEqual(
    tripImage.resolveTripImage({
      imageFileID: 'cloud://env/trips/dali-flower-01.jpg',
      image: '/images/trips/mock.png',
    }),
    'cloud://env/trips/dali-flower-01.jpg'
  );
  assert.strictEqual(
    tripImage.resolveTripImage({ image: '/images/trips/dali-flower-01.png' }),
    '/images/trips/dali-flower-01.png'
  );
});

test('view model shows feed hint after bowls empty more than 3 hours', () => {
  let state = game.createState(1);
  state = { ...state, food: 0, water: 0, emptySince: 1 };
  assert.strictEqual(game.viewModel(state, 1).showFeedHint, false);
  assert.strictEqual(
    game.viewModel(state, 1 + game.EMPTY_HUNGRY_MS).showFeedHint,
    false
  );
  assert.strictEqual(
    game.viewModel(state, 1 + game.EMPTY_HUNGRY_MS + 1).showFeedHint,
    true
  );
  state = game.feed(state, 1 + game.EMPTY_HUNGRY_MS + 1);
  assert.strictEqual(
    game.viewModel(state, 1 + game.EMPTY_HUNGRY_MS + 1).showFeedHint,
    false
  );
});

console.log('\n' + passed + ' tests passed');
