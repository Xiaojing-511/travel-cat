const TRIPS = require("../data/trips.js");

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const PORTION_G = 10;
const FEED_CAP_G = 50;
const FEED_LEAF_COST = 20;
const MID_SUPPLY_G = 20;
const HIGH_SUPPLY_G = 30;
const MEAL_CHANCE = 1 / 3;
const TRAVEL_CHANCE = 2 / 3;
const JOURNAL_BRING_DIVISOR = 3;
const FORGOT_KIND = "forgot";
const MEAL_CONSUME_MIN_G = 5;
const MEAL_CONSUME_MAX_G = 10;

const SLEEP_MIN_MS = 20 * MINUTE_MS;
const SLEEP_MAX_MS = 5 * HOUR_MS;
const IDLE_MIN_MS = 2 * MINUTE_MS;
const IDLE_MAX_MS = 10 * MINUTE_MS;
const IDLE_ART_MIN_MS = 5 * MINUTE_MS;
const IDLE_ART_MAX_MS = 8 * MINUTE_MS;
const WAIT_MIN_MS = 8 * MINUTE_MS;
const WAIT_MAX_MS = 4 * HOUR_MS;
const DECIDE_MIN_MS = 12 * 1000;
const DECIDE_MAX_MS = 25 * 1000;
const HUNGRY_MIN_MS = 10 * MINUTE_MS;
const HUNGRY_MAX_MS = 3 * HOUR_MS;
const EAT_MIN_MS = 5 * MINUTE_MS;
const EAT_MAX_MS = 15 * MINUTE_MS;
const DRINK_MIN_MS = 1 * MINUTE_MS;
const DRINK_MAX_MS = 5 * MINUTE_MS;

const DRINK_CHECK_MIN_MS = 2 * HOUR_MS;
const DRINK_CHECK_MAX_MS = 3 * HOUR_MS;
const EAT_CHECK_MIN_MS = 5 * HOUR_MS;
const EAT_CHECK_MAX_MS = 6 * HOUR_MS;
const EMPTY_HUNGRY_MS = 3 * HOUR_MS;
const WELCOME_HOLD_MS = 5 * 1000;
const RELIEF_MEAL_DELAY_MS = 5 * 1000;
const RELIEF_MEAL_AMOUNTS = [5, 10];

const TRAVEL_MAX_MS = 48 * HOUR_MS;
const LOW_TRAVEL_MIN_MS = 30 * MINUTE_MS;
const LOW_TRAVEL_MAX_MS = 7 * HOUR_MS;
const MID_TRAVEL_MIN_MS = 1 * HOUR_MS;
const MID_TRAVEL_MAX_MS = 12 * HOUR_MS;
const HIGH_TRAVEL_MIN_MS = 3 * HOUR_MS;
const HIGH_TRAVEL_MAX_MS = 24 * HOUR_MS;
const LEGACY_TRAVEL_DURATION_MS = 5 * MINUTE_MS;

const PLANTER_COUNT = 3;
const LEAF_BATCH = 10;
const LEAF_CAP = 30;
const GROW_MIN_MS = 10 * MINUTE_MS;
const GROW_MAX_MS = 4 * HOUR_MS;
const GROW_CATCHUP_GUARD = 200000;
// 生长间隔改成 10 分钟～4 小时后，旧存档的已摘叶子只清零一次。
const LEAF_STOCK_EPOCH = 1;

const ACTIVITIES = [
  "sleep",
  "idle",
  "wait",
  "decide",
  "hungry",
  "eat",
  "drink",
];
const HOME_ONLINE_ROTATION = ["sleep", "idle", "decide"];
const HOME_OFFLINE_ROTATION = ["sleep", "idle", "wait", "decide"];
const SLEEP_NAMES = ["sleep/001", "sleep/002", "sleep/003"];
const EAT_NAMES = ["eat/001", "eat/002"];
const IDLE_FRAME_NAMES = ["idle/001", "idle/002"];
const IDLE_NAMES = ["idle/001"];
const DEFAULT_NICKNAME = "小咪";
const NICKNAME_MAX = 10;
// 新增品种只加一条。姿势图放进 spriteDir，文件名与美短相同，扩展名跟磁盘一致。
// 睡觉帧不同时再写 sleepNames / sleepSequence。默认三帧来回：001-002-003-002。
// 旅行逻辑共用，只把云存储目录换成 cardFolder，文件名与 travel-cards 相同。
const BREEDS = [
  {
    id: "american",
    name: "美短",
    spriteDir: "/images/cat",
    spriteExt: "png",
    cardFolder: "travel-cards",
  },
  {
    id: "blue-golden",
    name: "蓝金渐层",
    spriteDir: "/images/cat-lanji",
    spriteExt: "png",
    cardFolder: "travel-cards-lanjin",
  },
];

function breedSpec(id) {
  const key = String(id == null ? "" : id);
  for (let i = 0; i < BREEDS.length; i++) {
    if (BREEDS[i].id === key) return BREEDS[i];
  }
  return BREEDS[0];
}

function spriteSrc(breedId, name) {
  const spec = breedSpec(breedId);
  return spec.spriteDir + "/" + name + "." + spec.spriteExt;
}

function spriteList(breedId, names) {
  const list = [];
  for (let i = 0; i < names.length; i++) {
    list.push(spriteSrc(breedId, names[i]));
  }
  return list;
}

function sleepNamesOf(breedId) {
  const names = breedSpec(breedId).sleepNames;
  return names && names.length ? names : SLEEP_NAMES;
}

function sleepSequenceOf(breedId) {
  const sequence = breedSpec(breedId).sleepSequence;
  return sequence && sequence.length ? sequence : SLEEP_SEQUENCE;
}

function cardFolders() {
  const folders = [];
  for (let i = 0; i < BREEDS.length; i++) {
    if (BREEDS[i].cardFolder) folders.push(BREEDS[i].cardFolder);
  }
  folders.sort((a, b) => b.length - a.length);
  return folders;
}

function cardImageFileID(fileID, breedId) {
  const value = String(fileID || "");
  if (value.indexOf("cloud://") !== 0) return value;
  const folder = breedSpec(breedId).cardFolder;
  if (!folder) return value;
  const folders = cardFolders();
  for (let i = 0; i < folders.length; i++) {
    const token = "/" + folders[i] + "/";
    const at = value.indexOf(token);
    if (at < 0) continue;
    return (
      value.slice(0, at) + "/" + folder + "/" + value.slice(at + token.length)
    );
  }
  return value;
}

const SLEEP_FRAMES = spriteList("", SLEEP_NAMES);
const EAT_SRC = spriteSrc("", "eat/001");
const IDLE_ARTS = spriteList("", IDLE_NAMES);
const SLEEP_FRAME_MS = 1000;
const SLEEP_SEQUENCE = [0, 1, 2, 1];
const EAT_FRAME_MS = 1000;
const EAT_SEQUENCE = [0, 1];
const IDLE_FRAME_MS = 1700;
const IDLE_SEQUENCE = [0, 1];
const TICK_GUARD = 8000;
const EVENT_PRIORITY = {
  travelCheck: 0,
  drink: 1,
  eat: 2,
  activity: 3,
  travelEnd: 4,
};

let randomFn = Math.random;

function setRandom(fn) {
  randomFn = typeof fn === "function" ? fn : Math.random;
}

function rand() {
  return randomFn();
}

function randInt(min, max) {
  return min + Math.floor(rand() * (max - min + 1));
}

function growDelay() {
  return randInt(GROW_MIN_MS, GROW_MAX_MS);
}

function blankPlanters() {
  const planters = [];
  for (let id = 1; id <= PLANTER_COUNT; id++) {
    planters.push({ id, leaves: 0, nextGrowAt: 0, hint: false });
  }
  return planters;
}

function planterStage(leaves) {
  const n = Number(leaves) || 0;
  if (n >= 30) return 3;
  if (n >= 20) return 2;
  if (n >= 10) return 1;
  return 0;
}

function planterArt(leaves) {
  return "/images/balcony/planter/0" + planterStage(leaves) + ".png";
}

function clampLeaves(value) {
  const n = Math.max(0, Math.floor(Number(value) || 0));
  return n > LEAF_CAP ? LEAF_CAP : n;
}

function normalizePlanters(raw, now) {
  const t = Number(now) || 0;
  const list = Array.isArray(raw) ? raw : [];
  const byId = {};
  for (let i = 0; i < list.length; i++) {
    const id = Number(list[i] && list[i].id);
    if (id >= 1 && id <= PLANTER_COUNT) byId[id] = list[i];
  }
  const planters = [];
  for (let id = 1; id <= PLANTER_COUNT; id++) {
    const item = byId[id];
    const leaves = clampLeaves(item && item.leaves);
    let nextGrowAt = Number(item && item.nextGrowAt) || 0;
    if (!(nextGrowAt > 0)) nextGrowAt = t + growDelay();
    planters.push({
      id,
      leaves,
      nextGrowAt,
      hint: leaves >= LEAF_BATCH,
    });
  }
  return planters;
}

function growPlanters(state, now) {
  const t = Number(now) || 0;
  const existing = Array.isArray(state && state.planters) ? state.planters : [];
  const byId = {};
  for (let i = 0; i < existing.length; i++) {
    const id = Number(existing[i] && existing[i].id);
    if (id >= 1 && id <= PLANTER_COUNT) byId[id] = existing[i];
  }
  const planters = [];
  let changed = existing.length !== PLANTER_COUNT;
  for (let id = 1; id <= PLANTER_COUNT; id++) {
    const item = byId[id];
    let leaves = clampLeaves(item && item.leaves);
    let nextGrowAt = Number(item && item.nextGrowAt) || 0;
    let hint = leaves >= LEAF_BATCH;
    if (item && Number(item.leaves) !== leaves) changed = true;
    if (!(nextGrowAt > 0)) {
      nextGrowAt = t + growDelay();
      changed = true;
    } else if (leaves >= LEAF_CAP) {
      if (nextGrowAt <= t) {
        nextGrowAt = t + growDelay();
        changed = true;
      }
    } else {
      let guard = 0;
      while (nextGrowAt <= t && leaves < LEAF_CAP && guard < GROW_CATCHUP_GUARD) {
        leaves = Math.min(LEAF_CAP, leaves + LEAF_BATCH);
        hint = leaves >= LEAF_BATCH;
        nextGrowAt += growDelay();
        changed = true;
        guard += 1;
      }
      if (leaves >= LEAF_CAP && nextGrowAt <= t) {
        nextGrowAt = t + growDelay();
        changed = true;
      }
    }
    if (
      !item ||
      Number(item.leaves) !== leaves ||
      Number(item.nextGrowAt) !== nextGrowAt ||
      !!item.hint !== hint
    ) {
      changed = true;
    }
    planters.push({ id, leaves, nextGrowAt, hint });
  }
  if (!changed) return state;
  return { ...state, planters };
}

function harvestPlanter(state, planterId, now, seenLeaves) {
  const id = Number(planterId);
  if (!(id >= 1 && id <= PLANTER_COUNT)) return null;
  const planters = (
    Array.isArray(state && state.planters) ? state.planters : []
  ).map((item) => ({
    id: Number(item.id),
    leaves: clampLeaves(item.leaves),
    nextGrowAt: Number(item.nextGrowAt) || 0,
    hint: !!item.hint,
  }));
  const pot = planters.find((item) => item.id === id);
  if (!pot || pot.leaves < LEAF_BATCH) return null;
  // 点下去时屏幕上的叶子。同一次请求里刚追赶出来的生长不计入这一把。
  let base = pot.leaves;
  if (seenLeaves != null && seenLeaves !== "") {
    const seen = clampLeaves(seenLeaves);
    if (seen < base) base = seen;
  }
  if (base < LEAF_BATCH) return null;
  pot.leaves = base - LEAF_BATCH;
  pot.hint = pot.leaves >= LEAF_BATCH;
  const t = Number(now);
  if (Number.isFinite(t) && t > 0 && !(pot.nextGrowAt > t)) {
    pot.nextGrowAt = t + growDelay();
  }
  return {
    ...state,
    planters,
    leafCount:
      Math.max(0, Math.floor(Number(state.leafCount) || 0)) + LEAF_BATCH,
  };
}

function commitHarvest(ticked, harvested, planterId, now) {
  const id = Number(planterId);
  const taken = (
    Array.isArray(harvested && harvested.planters) ? harvested.planters : []
  ).find((item) => Number(item.id) === id);
  if (!taken) return ticked;
  const t = Number(now) || 0;
  const leaves = clampLeaves(taken.leaves);
  const planters = (
    Array.isArray(ticked && ticked.planters) ? ticked.planters : []
  ).map((item) => {
    if (Number(item.id) !== id) return item;
    const rolled = Number(item.nextGrowAt) || 0;
    const kept = Number(taken.nextGrowAt) || 0;
    return {
      id,
      leaves,
      nextGrowAt: rolled > t ? rolled : kept,
      hint: leaves >= LEAF_BATCH,
    };
  });
  return {
    ...ticked,
    planters,
    leafCount:
      Math.max(0, Math.floor(Number(ticked.leafCount) || 0)) + LEAF_BATCH,
  };
}

function viewPlanters(planters) {
  const list = Array.isArray(planters) ? planters : [];
  const byId = {};
  for (let i = 0; i < list.length; i++) {
    const id = Number(list[i] && list[i].id);
    if (id >= 1 && id <= PLANTER_COUNT) byId[id] = list[i];
  }
  const out = [];
  for (let id = 1; id <= PLANTER_COUNT; id++) {
    const item = byId[id] || {};
    const leaves = clampLeaves(item.leaves);
    out.push({
      id,
      leaves,
      hint: leaves >= LEAF_BATCH,
      stage: planterStage(leaves),
      src: planterArt(leaves),
    });
  }
  return out;
}

function plantersForDoc(planters) {
  const list = Array.isArray(planters) ? planters : [];
  const byId = {};
  for (let i = 0; i < list.length; i++) {
    const id = Number(list[i] && list[i].id);
    if (id >= 1 && id <= PLANTER_COUNT) byId[id] = list[i];
  }
  const out = [];
  for (let id = 1; id <= PLANTER_COUNT; id++) {
    const item = byId[id] || {};
    const leaves = clampLeaves(item.leaves);
    out.push({
      id,
      leaves,
      nextGrowAt: Number(item.nextGrowAt) || 0,
      hint: leaves >= LEAF_BATCH,
    });
  }
  return out;
}

function durationOf(activity) {
  if (activity === "sleep") return randInt(SLEEP_MIN_MS, SLEEP_MAX_MS);
  if (activity === "idle") return randInt(IDLE_MIN_MS, IDLE_MAX_MS);
  if (activity === "wait") return randInt(WAIT_MIN_MS, WAIT_MAX_MS);
  if (activity === "decide") return randInt(DECIDE_MIN_MS, DECIDE_MAX_MS);
  if (activity === "hungry") return randInt(HUNGRY_MIN_MS, HUNGRY_MAX_MS);
  if (activity === "eat") return randInt(EAT_MIN_MS, EAT_MAX_MS);
  if (activity === "drink") return randInt(DRINK_MIN_MS, DRINK_MAX_MS);
  return IDLE_MIN_MS;
}

function pickIdleArt() {
  return Math.floor(rand() * IDLE_ARTS.length);
}

function pickNextIdleArt(current) {
  const cur = migrateIdleArt({ idleArt: current });
  if (IDLE_ARTS.length <= 1) return 0;
  const offset = randInt(1, IDLE_ARTS.length - 1);
  return (cur + offset) % IDLE_ARTS.length;
}

function idleArtDuration() {
  return randInt(IDLE_ART_MIN_MS, IDLE_ART_MAX_MS);
}

function standArtIndex() {
  const i = IDLE_ARTS.indexOf("/images/cat/stand.png");
  return i >= 0 ? i : 0;
}

function migrateIdleArt(raw) {
  const n = Number(raw && raw.idleArt);
  if (Number.isFinite(n)) {
    const i = Math.floor(n);
    if (i >= 0 && i < IDLE_ARTS.length) return i;
  }
  if (raw && raw.idleKind === "stand") return standArtIndex();
  if (raw && Number(raw.poseVariant) === 1 && IDLE_ARTS.length > 1) return 1;
  return 0;
}

function applyActivity(state, activity, now, durationMs) {
  const ms = durationMs == null ? durationOf(activity) : durationMs;
  const idle = activity === "idle";
  const meal = activity === "eat" || activity === "drink";
  return {
    ...state,
    activity,
    activityStartedAt: now,
    activityEndAt: now + Math.max(1, ms),
    poseVariant: Math.floor(rand() * 2),
    idleKind: rand() < 0.5 ? "stand" : "lie",
    idleArt: idle ? pickIdleArt() : migrateIdleArt(state),
    nextIdleArtAt: idle && IDLE_ARTS.length > 1 ? now + idleArtDuration() : 0,
    mealTotal: meal ? Math.max(0, Math.floor(Number(state.mealTotal) || 0)) : 0,
    mealApplied: meal
      ? Math.max(0, Math.floor(Number(state.mealApplied) || 0))
      : 0,
  };
}

function maybeSwitchIdleArt(state, now) {
  if (state.status === "traveling" || state.activity !== "idle") {
    return state;
  }
  if (IDLE_ARTS.length <= 1) return state;
  const due = Number(state.nextIdleArtAt) || 0;
  if (!(due > 0)) {
    return { ...state, nextIdleArtAt: now + idleArtDuration() };
  }
  if (due > now) return state;
  return {
    ...state,
    idleArt: pickNextIdleArt(migrateIdleArt(state)),
    nextIdleArtAt: now + idleArtDuration(),
  };
}

function isEmpty(state) {
  return state.food <= 0 && state.water <= 0;
}

function emptyFor(state, now) {
  if (!isEmpty(state)) return 0;
  if (!(state.emptySince > 0)) return 0;
  return Math.max(0, now - state.emptySince);
}

function isHungryWindow(state, now) {
  return isEmpty(state) && emptyFor(state, now) > EMPTY_HUNGRY_MS;
}

function syncEmptySince(state, at) {
  if (isEmpty(state)) {
    return {
      ...state,
      emptySince: state.emptySince > 0 ? state.emptySince : at,
    };
  }
  return { ...state, emptySince: 0 };
}

function isOnline(opts) {
  return !opts || opts.online !== false;
}

function pickNextActivity(state, now, opts) {
  const current = state && state.activity;
  const options = (
    isOnline(opts) ? HOME_ONLINE_ROTATION : HOME_OFFLINE_ROTATION
  ).slice();
  if (isHungryWindow(state, now) && options.indexOf("hungry") < 0) {
    options.push("hungry");
  }
  if (!isEmpty(state)) {
    const idx = options.indexOf("hungry");
    if (idx >= 0) options.splice(idx, 1);
  }
  const pool = options.filter((item) => item !== current);
  const list = pool.length ? pool : options;
  return list[Math.floor(rand() * list.length)];
}

function scheduleNeedChecks(state, now) {
  return {
    ...(state || {}),
    nextDrinkCheckAt: now + randInt(DRINK_CHECK_MIN_MS, DRINK_CHECK_MAX_MS),
    nextEatCheckAt: now + randInt(EAT_CHECK_MIN_MS, EAT_CHECK_MAX_MS),
  };
}

function scheduleTravelCheck(from) {
  return from + randInt(MINUTE_MS, DAY_MS);
}

function rescheduleTravelCheck(state, at) {
  const from =
    state.status === "traveling" && state.travelEndAt > at
      ? state.travelEndAt
      : at;
  return {
    ...state,
    nextTravelCheckAt: scheduleTravelCheck(from),
  };
}

function charCount(text) {
  return Array.from(text).length;
}

function sanitizeNickname(raw) {
  if (typeof raw !== "string") return "";
  const text = raw.trim();
  if (!text || charCount(text) > NICKNAME_MAX) return "";
  return text;
}

function nicknameIssue(raw) {
  if (typeof raw !== "string") return "empty";
  const text = raw.trim();
  if (!text) return "empty";
  if (charCount(text) > NICKNAME_MAX) return "long";
  return "";
}

function sanitizeBreed(raw) {
  const id = String(raw == null ? "" : raw);
  for (let i = 0; i < BREEDS.length; i++) {
    if (BREEDS[i].id === id) return id;
  }
  return "";
}

function readProfilePatch(raw, state) {
  const body = raw && typeof raw === "object" ? raw : {};
  const hasNick = Object.prototype.hasOwnProperty.call(body, "nickname");
  const hasBreed = Object.prototype.hasOwnProperty.call(body, "breed");
  if (!hasNick && !hasBreed) return { ok: false, code: "EMPTY_PROFILE" };
  const patch = {};
  if (hasNick) {
    const nickname = sanitizeNickname(body.nickname);
    if (!nickname) {
      return {
        ok: false,
        code:
          nicknameIssue(body.nickname) === "long"
            ? "NICKNAME_LONG"
            : "NICKNAME_INVALID",
      };
    }
    patch.nickname = nickname;
  }
  if (hasBreed) {
    if (state && state.breedLocked) return { ok: false, code: "BREED_LOCKED" };
    const breed = sanitizeBreed(body.breed);
    if (!breed) return { ok: false, code: "BREED_INVALID" };
    patch.breed = breed;
  }
  return { ok: true, patch };
}

function applyProfile(state, patch) {
  const next = { ...(state || {}) };
  if (patch && patch.nickname != null) next.nickname = patch.nickname;
  if (patch && patch.breed != null && !next.breedLocked) {
    next.breed = patch.breed;
    next.breedLocked = true;
  }
  return next;
}

const TUTORIAL_CLOCK_FIELDS = [
  "activityStartedAt",
  "activityEndAt",
  "travelStartedAt",
  "travelEndAt",
  "lastTravelAt",
  "emptySince",
  "nextDrinkCheckAt",
  "nextEatCheckAt",
  "nextIdleArtAt",
  "reliefMealAt",
  "welcomeHoldUntil",
  "nextTravelCheckAt",
];

function pauseTutorialClock(state, now) {
  const t = now || Date.now();
  const anchor = Number(state && state.tutorialAnchorAt) || 0;
  if (anchor > 0 && t < anchor) {
    return {
      ...(state || {}),
      tutorialDone: false,
      tutorialAnchorAt: anchor,
    };
  }
  const delta = anchor > 0 ? t - anchor : 0;
  const next = {
    ...(state || {}),
    tutorialDone: false,
    tutorialAnchorAt: t,
  };
  if (delta > 0) {
    TUTORIAL_CLOCK_FIELDS.forEach((key) => {
      const value = Number(state[key]) || 0;
      if (value > 0) next[key] = value + delta;
    });
  }
  return next;
}

function holdForTutorial(state, now) {
  return pauseTutorialClock(
    {
      ...(state || {}),
      tutorialDone: false,
      tutorialAnchorAt: 0,
    },
    now,
  );
}

function completeTutorial(state, now) {
  const t = now || Date.now();
  const base =
    state && state.tutorialDone === true
      ? { ...state }
      : pauseTutorialClock(state, t);
  return {
    ...base,
    tutorialDone: true,
    tutorialAnchorAt: 0,
  };
}

function createState(now) {
  const t = now || Date.now();
  const base = scheduleNeedChecks(
    {
      food: 0,
      water: 0,
      status: "home",
      nickname: DEFAULT_NICKNAME,
      breed: "",
      breedLocked: false,
      travelId: "",
      travelEndAt: 0,
      travelStartedAt: 0,
      travelBand: "",
      journalBand: "",
      lastTravelAt: 0,
      nextTravelCheckAt: scheduleTravelCheck(t),
      hasUnreadCard: false,
      lastCardTemplateId: "",
      cardCount: 0,
      collectedCards: [],
      createdAt: t,
      emptySince: t,
      tutorialDone: true,
      tutorialAnchorAt: 0,
      leafCount: 0,
      leafStockEpoch: LEAF_STOCK_EPOCH,
      planters: blankPlanters(),
    },
    t,
  );
  return {
    ...applyActivity(
      base,
      pickNextActivity({ activity: "", food: 0, water: 0, emptySince: t }, t),
      t,
    ),
    leafCount: 0,
    leafStockEpoch: LEAF_STOCK_EPOCH,
    planters: normalizePlanters(null, t),
  };
}

function migrateActivity(raw) {
  if (ACTIVITIES.indexOf(raw.activity) >= 0) return raw.activity;
  if (raw.pose === "sleep") return "sleep";
  if (raw.pose === "wait") return "wait";
  return "idle";
}

function normalize(raw, now) {
  const t = now || Date.now();
  const base = createState(t);
  if (!raw || typeof raw !== "object") return base;
  const tripById = {};
  for (let i = 0; i < TRIPS.length; i++) {
    tripById[TRIPS[i].id] = TRIPS[i];
  }
  const collectedCards = (
    Array.isArray(raw.collectedCards) ? raw.collectedCards : []
  ).map((card) => enrichCard(card, tripById, raw.breed));
  const activity = migrateActivity(raw);
  const food = Math.max(0, Math.min(FEED_CAP_G, Number(raw.food) || 0));
  const water = Math.max(0, Math.min(FEED_CAP_G, Number(raw.water) || 0));
  const empty = food <= 0 && water <= 0;
  const merged = {
    ...base,
    ...raw,
    food,
    water,
    status: raw.status === "traveling" ? "traveling" : "home",
    travelId: raw.status === "traveling" ? String(raw.travelId || "") : "",
    travelEndAt: Number(raw.travelEndAt) || 0,
    travelStartedAt: Number(raw.travelStartedAt) || 0,
    travelBand:
      raw.status === "traveling" ? sanitizeTravelBand(raw.travelBand) : "",
    journalBand:
      raw.status === "traveling" ? sanitizeJournalBand(raw.journalBand) : "",
    lastTravelAt: Number(raw.lastTravelAt) || 0,
    nextTravelCheckAt: Number(raw.nextTravelCheckAt) || scheduleTravelCheck(t),
    journalReadModel: 1,
    unreadCount:
      Number(raw.journalReadModel) >= 1
        ? Math.max(0, Math.floor(Number(raw.unreadCount) || 0))
        : 0,
    hasUnreadCard:
      Number(raw.journalReadModel) >= 1 &&
      Math.max(0, Math.floor(Number(raw.unreadCount) || 0)) > 0,
    lastCardTemplateId: String(
      raw.lastCardTemplateId || templateFromCards(collectedCards) || "",
    ),
    cardCount: Number(raw.cardCount) || collectedCards.length,
    collectedCards,
    activity,
    activityStartedAt: Number(raw.activityStartedAt) || t,
    activityEndAt: Number(raw.activityEndAt) || t + durationOf(activity),
    poseVariant: Number(raw.poseVariant) === 1 ? 1 : 0,
    idleKind: raw.idleKind === "stand" ? "stand" : "lie",
    idleArt: migrateIdleArt(raw),
    nextIdleArtAt:
      activity === "idle"
        ? Number(raw.nextIdleArtAt) || t + idleArtDuration()
        : 0,
    createdAt: Number(raw.createdAt) || t,
    emptySince: empty
      ? Number(raw.emptySince) || Number(raw.createdAt) || t
      : 0,
    nextDrinkCheckAt:
      Number(raw.nextDrinkCheckAt) ||
      t + randInt(DRINK_CHECK_MIN_MS, DRINK_CHECK_MAX_MS),
    nextEatCheckAt:
      Number(raw.nextEatCheckAt) ||
      t + randInt(EAT_CHECK_MIN_MS, EAT_CHECK_MAX_MS),
    welcomeHoldUntil: Number(raw.welcomeHoldUntil) || 0,
    reliefMealAt: Number(raw.reliefMealAt) || 0,
    mealTotal:
      activity === "eat" || activity === "drink"
        ? Math.max(0, Math.floor(Number(raw.mealTotal) || 0))
        : 0,
    mealApplied:
      activity === "eat" || activity === "drink"
        ? Math.min(
            Math.max(0, Math.floor(Number(raw.mealTotal) || 0)),
            Math.max(0, Math.floor(Number(raw.mealApplied) || 0)),
          )
        : 0,
    nickname: sanitizeNickname(raw.nickname) || DEFAULT_NICKNAME,
    breed: sanitizeBreed(raw.breed),
    breedLocked: !!(raw.breedLocked && sanitizeBreed(raw.breed)),
    tutorialDone: raw.tutorialDone !== false,
    tutorialAnchorAt: Number(raw.tutorialAnchorAt) || 0,
    leafCount:
      Number(raw.leafStockEpoch) === LEAF_STOCK_EPOCH
        ? Math.max(0, Math.floor(Number(raw.leafCount) || 0))
        : 0,
    leafStockEpoch: LEAF_STOCK_EPOCH,
    planters: normalizePlanters(raw.planters, t),
  };
  return merged;
}

function isReady(state) {
  return state.food >= PORTION_G && state.water >= PORTION_G;
}

function canFeed(state) {
  return state.food < FEED_CAP_G || state.water < FEED_CAP_G;
}

function feedBlockedByLeaves(state, now) {
  const t = now == null ? Date.now() : now;
  const settled = settleMeal(state, t);
  if (!canFeed(settled)) return false;
  const leaves = Math.max(0, Math.floor(Number(settled.leafCount) || 0));
  return leaves < FEED_LEAF_COST;
}

function canDepart(state) {
  return state.status !== "traveling";
}

function atDoor(state) {
  return state.activity === "wait" || state.activity === "decide";
}

function getStatusText(state) {
  if (state.status === "traveling") return "旅行中~";
  if (state.activity === "sleep") return "睡觉中...";
  if (state.activity === "eat") return "吃饭中...";
  if (state.activity === "drink") return "喝水中...";
  if (state.activity === "decide") return "要出门吗...";
  if (state.activity === "wait") return "在等你~";
  if (state.activity === "hungry") return "等饭中...";
  return "发呆中...";
}

function getLoopSrc(frames, sequence, frameMs, now, startedAt) {
  const t = now == null ? Date.now() : now;
  const origin = Number(startedAt) || 0;
  const elapsed = Math.max(0, t - origin);
  const step = Math.floor(elapsed / frameMs) % sequence.length;
  return frames[sequence[step]];
}

function getSleepSrc(now, startedAt, breedId) {
  return getLoopSrc(
    spriteList(breedId, sleepNamesOf(breedId)),
    sleepSequenceOf(breedId),
    SLEEP_FRAME_MS,
    now,
    startedAt,
  );
}

function usesLoopFrames(state) {
  return (
    state.activity === "sleep" ||
    state.activity === "idle" ||
    state.activity === "hungry" ||
    state.activity === "eat" ||
    state.activity === "drink"
  );
}

function getCatSrc(state, now) {
  const breedId = state && state.breed;
  if (state.activity === "sleep") {
    return getSleepSrc(now, state.activityStartedAt, breedId);
  }
  if (state.activity === "wait" || state.activity === "decide") {
    return spriteSrc(breedId, "wait");
  }
  if (busyWithMeal(state)) {
    return getLoopSrc(
      spriteList(breedId, EAT_NAMES),
      EAT_SEQUENCE,
      EAT_FRAME_MS,
      now,
      state.activityStartedAt,
    );
  }
  return getLoopSrc(
    spriteList(breedId, IDLE_FRAME_NAMES),
    IDLE_SEQUENCE,
    IDLE_FRAME_MS,
    now,
    state.activityStartedAt,
  );
}

function bowlLevel(grams) {
  const n = Math.max(0, Number(grams) || 0);
  if (n <= 0) return 0;
  return Math.min(FEED_CAP_G, Math.ceil(n / PORTION_G) * PORTION_G);
}

function getBowlSrc(kind, grams) {
  const folder = kind === "food" ? "food" : "water";
  return "/images/" + folder + "/" + bowlLevel(grams) + ".png";
}

function emptyTooLong(state, now) {
  if (!isEmpty(state)) return false;
  if (!(state && state.emptySince > 0)) return false;
  return now - state.emptySince > EMPTY_HUNGRY_MS;
}

function shouldScheduleReliefMeal(state, now) {
  return (
    state.status !== "traveling" &&
    emptyTooLong(state, now) &&
    !(state.reliefMealAt > 0)
  );
}

function pickReliefKind() {
  return rand() < 0.5 ? "eat" : "drink";
}

function pickReliefAmount() {
  return RELIEF_MEAL_AMOUNTS[rand() < 0.5 ? 0 : 1];
}

function mealStockField(activity) {
  return activity === "eat" ? "food" : "water";
}

function beginMeal(state, kind, at, consume) {
  return applyActivity(
    {
      ...state,
      mealTotal: Math.max(0, Math.floor(Number(consume) || 0)),
      mealApplied: 0,
    },
    kind,
    at,
    durationOf(kind),
  );
}

function mealDueGrams(state, now) {
  const total = Math.max(0, Math.floor(Number(state.mealTotal) || 0));
  if (!busyWithMeal(state) || total <= 0) return 0;
  const start = Number(state.activityStartedAt) || 0;
  const end = Number(state.activityEndAt) || start;
  if (now >= end) return total;
  const elapsed = Math.max(0, now - start);
  const span = Math.max(1, end - start);
  return Math.min(total, Math.floor((total * elapsed) / span));
}

function mealGramAt(state, grams) {
  const total = Math.max(0, Math.floor(Number(state.mealTotal) || 0));
  const start = Number(state.activityStartedAt) || 0;
  const end = Number(state.activityEndAt) || start;
  if (grams <= 0) return start;
  if (!(total > 0) || grams >= total) return end;
  const span = Math.max(1, end - start);
  return start + Math.ceil((grams * span) / total);
}

function settleMeal(state, now) {
  if (!state || !busyWithMeal(state)) return state;
  const total = Math.max(0, Math.floor(Number(state.mealTotal) || 0));
  const applied = Math.min(
    total,
    Math.max(0, Math.floor(Number(state.mealApplied) || 0)),
  );
  const due = mealDueGrams(state, now);
  if (due <= applied) return state;
  const field = mealStockField(state.activity);
  const before = Math.max(0, Number(state[field]) || 0);
  const take = Math.min(before, due - applied);
  const next = {
    ...state,
    [field]: before - take,
    mealApplied: due,
  };
  if (!isEmpty(state) && isEmpty(next)) {
    return { ...next, emptySince: mealGramAt(state, applied + before) };
  }
  return syncEmptySince(next, now);
}

function doReliefMeal(state, at) {
  let next = {
    ...state,
    reliefMealAt: 0,
    welcomeHoldUntil: 0,
  };
  if (next.status === "traveling") return next;
  const kind = pickReliefKind();
  const stock = kind === "eat" ? next.food : next.water;
  const consume = Math.min(stock, pickReliefAmount());
  next = beginMeal(next, kind, at, consume);
  if (next.nextDrinkCheckAt <= at) {
    next = {
      ...next,
      nextDrinkCheckAt: at + randInt(DRINK_CHECK_MIN_MS, DRINK_CHECK_MAX_MS),
    };
  }
  if (next.nextEatCheckAt <= at) {
    next = {
      ...next,
      nextEatCheckAt: at + randInt(EAT_CHECK_MIN_MS, EAT_CHECK_MAX_MS),
    };
  }
  return next;
}

function feed(state, now) {
  const t = now == null ? Date.now() : now;
  const settled = settleMeal(state, t);
  if (!canFeed(settled)) return settled;
  const leaves = Math.max(0, Math.floor(Number(settled.leafCount) || 0));
  if (leaves < FEED_LEAF_COST) return settled;
  const thank = shouldScheduleReliefMeal(settled, t);
  let next = {
    ...settled,
    food: Math.min(FEED_CAP_G, settled.food + PORTION_G),
    water: Math.min(FEED_CAP_G, settled.water + PORTION_G),
    leafCount: leaves - FEED_LEAF_COST,
  };
  next = syncEmptySince(next, t);
  if (thank) {
    const at = t + RELIEF_MEAL_DELAY_MS;
    return {
      ...next,
      reliefMealAt: at,
      activityEndAt: at,
      nextDrinkCheckAt: Math.max(next.nextDrinkCheckAt || 0, at + 1),
      nextEatCheckAt: Math.max(next.nextEatCheckAt || 0, at + 1),
    };
  }
  if (next.activity === "hungry") {
    next = applyActivity(next, "idle", t);
  }
  return next;
}

function sanitizeTravelBand(band) {
  if (band === "low" || band === "mid" || band === "high") return band;
  return "";
}

function sanitizeJournalBand(band) {
  if (
    band === "empty" ||
    band === "half" ||
    band === "short" ||
    band === "full"
  ) {
    return band;
  }
  return "";
}

function travelBand(state) {
  const food = Math.max(0, Number(state && state.food) || 0);
  const water = Math.max(0, Number(state && state.water) || 0);
  if (food >= HIGH_SUPPLY_G && water >= HIGH_SUPPLY_G) return "high";
  if (food >= MID_SUPPLY_G && water >= MID_SUPPLY_G) return "mid";
  return "low";
}

function journalBand(state) {
  const food = Math.max(0, Number(state && state.food) || 0);
  const water = Math.max(0, Number(state && state.water) || 0);
  if (food <= 0 && water <= 0) return "empty";
  if (food <= 0 || water <= 0) return "half";
  if (food < PORTION_G && water < PORTION_G) return "short";
  return "full";
}

function pickTravelDuration(band) {
  if (band === "high") return randInt(HIGH_TRAVEL_MIN_MS, HIGH_TRAVEL_MAX_MS);
  if (band === "mid") return randInt(MID_TRAVEL_MIN_MS, MID_TRAVEL_MAX_MS);
  return randInt(LOW_TRAVEL_MIN_MS, LOW_TRAVEL_MAX_MS);
}

function travelCost(band, durationMs, state) {
  if (band === "low") {
    return { food: Math.max(0, state.food), water: Math.max(0, state.water) };
  }
  if (band === "high" && durationMs > 12 * HOUR_MS) {
    return { food: 20, water: 10 };
  }
  if (durationMs > 6 * HOUR_MS) {
    return { food: 10, water: 10 };
  }
  return { food: 0, water: 0 };
}

function depart(state, now, durationMs, templates) {
  if (!canDepart(state)) return state;
  const band = travelBand(state);
  const photos = journalBand(state);
  const picked = durationMs == null ? pickTravelDuration(band) : durationMs;
  const duration = Math.min(Math.max(1, picked), TRAVEL_MAX_MS);
  const cost = travelCost(band, duration, state);
  const trip = pickTrip(state, templates);
  const next = {
    ...state,
    food: Math.max(0, state.food - cost.food),
    water: Math.max(0, state.water - cost.water),
    status: "traveling",
    travelId: trip && trip.id ? trip.id : "",
    travelEndAt: now + duration,
    travelStartedAt: now,
    travelBand: band,
    journalBand: photos,
    lastTravelAt: now,
    nextTravelCheckAt: scheduleTravelCheck(now + duration),
  };
  return syncEmptySince(next, now);
}

function tryTravelAt(state, at, templates) {
  if (state.status === "traveling") return state;
  return depart(state, at, undefined, templates);
}

function shouldTravelFromDecide(state) {
  if (state && state.debugForceTravel) return true;
  if (state && state.debugForceStay) return false;
  return rand() < TRAVEL_CHANCE;
}

function isForgotCard(card) {
  return !!(card && card.kind === FORGOT_KIND);
}

function templateFromCards(cards) {
  if (!cards) return "";
  for (let i = 0; i < cards.length; i++) {
    const id = cards[i] && cards[i].templateId;
    if (id && !isForgotCard(cards[i])) return id;
  }
  return "";
}

function lastTemplateId(source) {
  if (!source) return "";
  if (Array.isArray(source)) return templateFromCards(source);
  if (source.lastCardTemplateId) return source.lastCardTemplateId;
  return templateFromCards(source.collectedCards);
}

function tripHasArt(item) {
  if (!item) return false;
  if (item.imageFileID) return true;
  return !!item.image;
}

function findTrip(id, templates) {
  const list = templates && templates.length ? templates : TRIPS;
  if (!id) return null;
  for (let i = 0; i < list.length; i++) {
    if (list[i] && list[i].id === id) return list[i];
  }
  return null;
}

function presentCard(card, breedId) {
  if (!card || typeof card !== "object") return card;
  if (isForgotCard(card)) return card;
  const template = findTrip(card.templateId);
  const base = (template && template.imageFileID) || card.imageFileID || "";
  const imageFileID = cardImageFileID(base, breedId);
  if (!imageFileID || imageFileID === (card.imageFileID || "")) return card;
  return { ...card, imageFileID };
}

function pickTrip(source, templates, seed) {
  const list = templates && templates.length ? templates : TRIPS;
  const withPhoto = list.filter(tripHasArt);
  const candidates = withPhoto.length ? withPhoto : list;
  const lastId = lastTemplateId(source);
  const pool = lastId
    ? candidates.filter((item) => item.id !== lastId)
    : candidates;
  const sourceList = pool.length ? pool : candidates;
  const n =
    seed != null && seed !== "" ? hashSeed(String(seed)) / 4294967296 : rand();
  return sourceList[Math.floor(n * sourceList.length)];
}

function pad2(n) {
  return n < 10 ? "0" + n : String(n);
}

function formatTime(ts) {
  const d = new Date(ts);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function formatDate(ts) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatDateTime(ts) {
  return `${formatDate(ts)} ${formatTime(ts)}`;
}

function sameCalendarDay(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function formatListDateTime(ts, now) {
  const at = now == null ? Date.now() : now;
  if (sameCalendarDay(ts, at)) return formatTime(ts);
  return `${formatTime(ts)} ${formatDate(ts)}`;
}

function cardListTime(card) {
  return Number((card && (card.startedAt || card.collectedAt)) || 0);
}

function sortCardsByListDate(cards) {
  return (Array.isArray(cards) ? cards.slice() : []).sort(
    (a, b) => cardListTime(b) - cardListTime(a),
  );
}

function hashSeed(str) {
  let h = 2166136261;
  const s = String(str || "");
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickJournaledAt(startedAt, endedAt, seed) {
  const start = Number(startedAt) || 0;
  const end = Number(endedAt) || start;
  const span = end - start;
  if (span <= 1) return start;
  return start + (hashSeed(seed) % span);
}

function bringsJournal(startedAt, endedAt, band) {
  const seed = `${Number(startedAt) || 0}:${Number(endedAt) || 0}`;
  const n = hashSeed(seed);
  const mixed = n >>> 8;
  const photos = sanitizeJournalBand(band);
  if (photos === "full") return true;
  if (photos === "short") return mixed % 3 < 2;
  if (photos === "half") return mixed % 2 === 0;
  if (photos === "empty") return n % JOURNAL_BRING_DIVISOR === 0;
  const tier = sanitizeTravelBand(band) || "low";
  if (tier === "high") return mixed % 3 < 2;
  if (tier === "mid") return mixed % 2 === 0;
  return n % JOURNAL_BRING_DIVISOR === 0;
}

function enrichCard(card, tripById, breedId) {
  if (!card || typeof card !== "object") return card;
  if (isForgotCard(card)) {
    const endedAt = Number(card.collectedAt) || 0;
    const startedAt =
      Number(card.startedAt) ||
      (endedAt ? endedAt - LEGACY_TRAVEL_DURATION_MS : 0);
    return {
      ...card,
      kind: FORGOT_KIND,
      templateId: "",
      location: "",
      image: "",
      imageFileID: "",
      journal: "",
      startedAt,
      journaledAt: Number(card.journaledAt) || startedAt,
    };
  }
  const template = tripById && card.templateId && tripById[card.templateId];
  const endedAt = Number(card.collectedAt) || 0;
  const startedAt =
    Number(card.startedAt) ||
    (endedAt ? endedAt - LEGACY_TRAVEL_DURATION_MS : 0);
  const journaledAt =
    Number(card.journaledAt) || pickJournaledAt(startedAt, endedAt, card.id);
  const next = {
    ...card,
    startedAt,
    journaledAt,
  };
  const imageFileID = cardImageFileID(
    (template && template.imageFileID) || card.imageFileID || "",
    breedId,
  );
  if (imageFileID && next.imageFileID !== imageFileID) {
    next.imageFileID = imageFileID;
  }
  if (template && template.image && card.image !== template.image) {
    next.image = template.image;
  }
  return next;
}

function cardId(startedAt, endedAt, templateId) {
  return `${Number(startedAt) || 0}:${Number(endedAt) || 0}:${String(
    templateId || "",
  )}`;
}

function tripTimes(now, trip) {
  const endedAt =
    trip && trip.endedAt != null ? Number(trip.endedAt) : Number(now) || 0;
  const startedAt =
    trip && trip.startedAt != null
      ? Number(trip.startedAt)
      : endedAt - LEGACY_TRAVEL_DURATION_MS;
  return { startedAt, endedAt };
}

function makeForgotCard(now, trip) {
  const times = tripTimes(now, trip);
  return {
    id: cardId(times.startedAt, times.endedAt, FORGOT_KIND),
    kind: FORGOT_KIND,
    templateId: "",
    location: "",
    image: "",
    imageFileID: "",
    journal: "",
    collectedAt: times.endedAt,
    startedAt: times.startedAt,
    journaledAt: times.startedAt,
  };
}

function makeCard(template, now, trip) {
  const times = tripTimes(now, trip);
  const endedAt = times.endedAt;
  const startedAt = times.startedAt;
  const id = cardId(startedAt, endedAt, template && template.id);
  const journaledAt = pickJournaledAt(startedAt, endedAt, id);
  return {
    id,
    templateId: template.id,
    location: template.location,
    image: template.image || "",
    imageFileID: cardImageFileID(
      template.imageFileID || "",
      trip && trip.breed,
    ),
    journal: template.journal,
    collectedAt: endedAt,
    startedAt,
    journaledAt,
    unread: true,
  };
}

function completeTravel(state, now, templates, opts) {
  const endedAt = state.travelEndAt > 0 ? state.travelEndAt : now;
  const startedAt =
    state.travelStartedAt > 0
      ? state.travelStartedAt
      : endedAt - LEGACY_TRAVEL_DURATION_MS;
  const journal =
    state && state.debugForceForgot
      ? false
      : state && state.debugForceJournal
        ? true
        : bringsJournal(
            startedAt,
            endedAt,
            state.journalBand || state.travelBand,
          );
  let card;
  let lastCardTemplateId =
    state.lastCardTemplateId || lastTemplateId(state) || "";
  if (journal) {
    const locked = findTrip(state.travelId, templates);
    const template =
      locked ||
      pickTrip(
        state,
        templates,
        `${startedAt}:${endedAt}:${state.travelId || ""}`,
      );
    card = makeCard(template, endedAt, {
      startedAt,
      endedAt,
      breed: state.breed,
    });
    lastCardTemplateId = card.templateId;
  } else {
    card = makeForgotCard(endedAt, { startedAt, endedAt });
  }
  const prevCount = Number(state.cardCount);
  const unreadCount =
    Math.max(0, Math.floor(Number(state.unreadCount) || 0)) + (journal ? 1 : 0);
  const home = {
    ...state,
    status: "home",
    travelId: "",
    travelEndAt: 0,
    travelStartedAt: 0,
    travelBand: "",
    journalBand: "",
    unreadCount,
    hasUnreadCard: unreadCount > 0,
    lastCardTemplateId,
    cardCount:
      (Number.isFinite(prevCount) && prevCount > 0
        ? prevCount
        : (state.collectedCards || []).length) + 1,
    collectedCards: [card, ...(state.collectedCards || [])],
  };
  const activity = pickNextActivity(home, now, opts);
  return {
    state: applyActivity(home, activity, now),
    card,
  };
}

function remainMs(state, now) {
  if (state.status !== "traveling") return 0;
  return Math.max(0, state.travelEndAt - now);
}

function statusRemainMs(state, now) {
  if (state.status === "traveling") return remainMs(state, now);
  return Math.max(0, (Number(state.activityEndAt) || 0) - now);
}

function formatRemain(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${pad2(m)}:${pad2(s)}`;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function formatAway(state, now) {
  if (state.status !== "traveling") return "";
  const start = state.travelStartedAt || now;
  const totalMinutes = Math.max(0, Math.floor((now - start) / MINUTE_MS));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  const parts = [];
  if (days > 0) parts.push(`${days} 天`);
  if (hours > 0) parts.push(`${hours} 小时`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes} 分钟`);
  return `已出门 ${parts.join(" ")}`;
}

function switchHome(state, now, opts, templates) {
  const settled = settleMeal(state, now);
  const willTravel =
    settled.activity === "decide" && shouldTravelFromDecide(settled);
  const next = {
    ...settled,
    debugForceTravel: false,
    debugForceStay: false,
  };
  if (willTravel) return depart(next, now, undefined, templates);
  const activity = pickNextActivity(next, now, opts);
  return applyActivity(next, activity, now);
}

function shouldTakeMeal() {
  return rand() < MEAL_CHANCE;
}

function pickMealConsume(stock) {
  if (stock <= 0) return 0;
  return Math.min(stock, randInt(MEAL_CONSUME_MIN_G, MEAL_CONSUME_MAX_G));
}

function busyWithMeal(state) {
  return state.activity === "eat" || state.activity === "drink";
}

function doDrinkCheck(state, at) {
  if (state.activity === "sleep") {
    return {
      ...state,
      nextDrinkCheckAt: Math.max(at + 1, (state.activityEndAt || at) + 1),
    };
  }
  if (busyWithMeal(state)) {
    return {
      ...state,
      nextDrinkCheckAt: Math.max(at + 1, state.activityEndAt || at + 1),
    };
  }
  let next = {
    ...state,
    nextDrinkCheckAt: at + randInt(DRINK_CHECK_MIN_MS, DRINK_CHECK_MAX_MS),
  };
  if (state.water <= 0 || !shouldTakeMeal()) return next;
  return beginMeal(next, "drink", at, pickMealConsume(state.water));
}

function doEatCheck(state, at) {
  if (state.activity === "sleep") {
    return {
      ...state,
      nextEatCheckAt: Math.max(at + 1, (state.activityEndAt || at) + 1),
    };
  }
  if (busyWithMeal(state)) {
    return {
      ...state,
      nextEatCheckAt: Math.max(at + 1, state.activityEndAt || at + 1),
    };
  }
  let next = {
    ...state,
    nextEatCheckAt: at + randInt(EAT_CHECK_MIN_MS, EAT_CHECK_MAX_MS),
  };
  if (state.food <= 0 || !shouldTakeMeal()) return next;
  return beginMeal(next, "eat", at, pickMealConsume(state.food));
}

function nextEvent(state) {
  if (state.status === "traveling") {
    return { type: "travelEnd", at: state.travelEndAt };
  }
  if (state.reliefMealAt > 0) {
    return { type: "reliefMeal", at: state.reliefMealAt };
  }
  if (state.welcomeHoldUntil > 0 && state.activity === "wait") {
    return { type: "welcomeHoldEnd", at: state.welcomeHoldUntil };
  }
  const events = [
    { type: "activity", at: state.activityEndAt },
    { type: "drink", at: state.nextDrinkCheckAt },
    { type: "eat", at: state.nextEatCheckAt },
  ];
  events.sort((a, b) => {
    const dt = a.at - b.at;
    if (dt !== 0) return dt;
    return EVENT_PRIORITY[a.type] - EVENT_PRIORITY[b.type];
  });
  return events[0];
}

function applyEvent(state, event, templates, opts) {
  const at = event.at;
  if (event.type === "travelEnd") {
    const done = completeTravel(state, at, templates, opts);
    return { state: done.state, completed: true, card: done.card };
  }
  if (event.type === "drink") {
    return { state: doDrinkCheck(state, at), completed: false };
  }
  if (event.type === "eat") {
    return { state: doEatCheck(state, at), completed: false };
  }
  if (event.type === "reliefMeal") {
    return { state: doReliefMeal(state, at), completed: false };
  }
  if (event.type === "welcomeHoldEnd") {
    return { state: finishWelcomeHold(state, at), completed: false };
  }
  if (event.type === "activity") {
    return { state: switchHome(state, at, opts, templates), completed: false };
  }
  return { state, completed: false };
}

function welcomeHome(state, now) {
  if (state.status !== "home" || state.activity !== "wait") return state;
  const next = isHungryWindow(state, now) ? "hungry" : "idle";
  return applyActivity({ ...state, welcomeHoldUntil: 0 }, next, now);
}

function finishWelcomeHold(state, now) {
  const cleared = { ...state, welcomeHoldUntil: 0 };
  if (cleared.status !== "home" || cleared.activity !== "wait") return cleared;
  return welcomeHome(cleared, now);
}

function collapseCatchUp(state, now, templates, opts, newCards) {
  let current = state;
  if (current.status === "traveling") {
    const done = completeTravel(
      current,
      current.travelEndAt > 0 ? current.travelEndAt : now,
      templates,
      opts,
    );
    current = done.state;
    if (done.card) newCards.push(done.card);
  }
  if (busyWithMeal(current)) {
    const end = Number(current.activityEndAt) || now;
    current = settleMeal(current, end > 0 && end <= now ? end : now);
  }
  current = {
    ...current,
    reliefMealAt: 0,
    welcomeHoldUntil: 0,
    nextDrinkCheckAt: now + randInt(DRINK_CHECK_MIN_MS, DRINK_CHECK_MAX_MS),
    nextEatCheckAt: now + randInt(EAT_CHECK_MIN_MS, EAT_CHECK_MAX_MS),
  };
  return applyActivity(current, pickNextActivity(current, now, opts), now);
}

function tick(state, now, templates, options) {
  if (state && state.tutorialDone !== true) {
    const grown = growPlanters(state, now);
    const paused = pauseTutorialClock(grown, now);
    return {
      state: paused,
      completed: false,
      changed:
        grown !== state || paused.tutorialAnchorAt !== state.tutorialAnchorAt,
      welcomeBack: false,
      newCards: [],
      remainMs: remainMs(paused, now),
    };
  }
  const enteringApp = !!(options && options.enteringApp);
  const catchUpOpts = { online: !enteringApp };
  let current = state;
  let completed = false;
  let changed = false;
  let lastKey = "";
  const newCards = [];
  for (let i = 0; i < TICK_GUARD; i++) {
    const event = nextEvent(current);
    if (!event || event.at == null || event.at > now) break;
    const key = event.type + ":" + event.at;
    if (key === lastKey) break;
    lastKey = key;
    const step = applyEvent(current, event, templates, catchUpOpts);
    current = step.state;
    changed = true;
    if (step.completed) completed = true;
    if (step.card) newCards.push(step.card);
    if (i === TICK_GUARD - 1) {
      const still = nextEvent(current);
      if (still && still.at != null && still.at <= now) {
        current = collapseCatchUp(
          current,
          now,
          templates,
          catchUpOpts,
          newCards,
        );
        changed = true;
        if (current.status === "home")
          completed = completed || newCards.length > 0;
      }
    }
  }
  let welcomeBack = false;
  if (enteringApp && current.status === "home" && current.activity === "wait") {
    current = {
      ...current,
      welcomeHoldUntil: now + WELCOME_HOLD_MS,
    };
    welcomeBack = true;
    changed = true;
  }
  const drained = settleMeal(current, now);
  if (drained !== current) {
    current = drained;
    changed = true;
  }
  const posed = maybeSwitchIdleArt(current, now);
  if (posed !== current) {
    current = posed;
    changed = true;
  }
  const grown = growPlanters(current, now);
  if (grown !== current) {
    current = grown;
    changed = true;
  }
  return {
    state: current,
    completed,
    changed,
    welcomeBack,
    newCards,
    remainMs: remainMs(current, now),
  };
}

function toPlayerDoc(state) {
  const collected = Array.isArray(state.collectedCards)
    ? state.collectedCards
    : [];
  return {
    food: state.food,
    water: state.water,
    status: state.status,
    activity: state.activity,
    activityStartedAt: Number(state.activityStartedAt) || 0,
    activityEndAt: Number(state.activityEndAt) || 0,
    travelId: state.travelId || "",
    travelStartedAt: Number(state.travelStartedAt) || 0,
    travelEndAt: Number(state.travelEndAt) || 0,
    travelBand:
      state.status === "traveling" ? sanitizeTravelBand(state.travelBand) : "",
    journalBand:
      state.status === "traveling"
        ? sanitizeJournalBand(state.journalBand)
        : "",
    lastTravelAt: Number(state.lastTravelAt) || 0,
    emptySince: Number(state.emptySince) || 0,
    nextDrinkCheckAt: Number(state.nextDrinkCheckAt) || 0,
    nextEatCheckAt: Number(state.nextEatCheckAt) || 0,
    reliefMealAt: Number(state.reliefMealAt) || 0,
    mealTotal: busyWithMeal(state)
      ? Math.max(0, Math.floor(Number(state.mealTotal) || 0))
      : 0,
    mealApplied: busyWithMeal(state)
      ? Math.max(0, Math.floor(Number(state.mealApplied) || 0))
      : 0,
    idleArt: migrateIdleArt(state),
    idleKind: state.idleKind === "stand" ? "stand" : "lie",
    poseVariant: Number(state.poseVariant) === 1 ? 1 : 0,
    nextIdleArtAt: Number(state.nextIdleArtAt) || 0,
    unreadCount: Math.max(0, Math.floor(Number(state.unreadCount) || 0)),
    hasUnreadCard: Math.max(0, Math.floor(Number(state.unreadCount) || 0)) > 0,
    journalReadModel: Number(state.journalReadModel) >= 1 ? 1 : 0,
    lastCardTemplateId: String(
      state.lastCardTemplateId || lastTemplateId(state) || "",
    ),
    cardCount: Number(state.cardCount) || collected.length,
    createdAt: Number(state.createdAt) || 0,
    nickname: sanitizeNickname(state.nickname) || DEFAULT_NICKNAME,
    breed: sanitizeBreed(state.breed),
    breedLocked: !!(state.breedLocked && sanitizeBreed(state.breed)),
    tutorialDone: state.tutorialDone === true,
    tutorialAnchorAt: Number(state.tutorialAnchorAt) || 0,
    leafCount: Math.max(0, Math.floor(Number(state.leafCount) || 0)),
    leafStockEpoch:
      Number(state.leafStockEpoch) === LEAF_STOCK_EPOCH ? LEAF_STOCK_EPOCH : 0,
    planters: plantersForDoc(state.planters),
  };
}

function clearUnread(state) {
  if (!state.hasUnreadCard) return state;
  return { ...state, hasUnreadCard: false };
}

function adjustUnread(state, delta) {
  const unreadCount = Math.max(
    0,
    Math.floor(Number(state && state.unreadCount) || 0) + (Number(delta) || 0),
  );
  return { ...state, unreadCount, hasUnreadCard: unreadCount > 0 };
}

function markCardRead(state, cardId) {
  const id = String(cardId || "");
  let changed = false;
  const collectedCards = (state.collectedCards || []).map((card) => {
    if (!card || String(card.id || "") !== id || !card.unread) return card;
    changed = true;
    return { ...card, unread: false };
  });
  if (!changed) return state;
  return adjustUnread({ ...state, collectedCards }, -1);
}

function formatTravelOut(state) {
  const nickname = state.nickname || DEFAULT_NICKNAME;
  if (nickname === DEFAULT_NICKNAME) return "它出门了";
  return `${nickname}出门了`;
}

function viewModel(state, now) {
  const shown = settleMeal(state, now);
  const traveling = shown.status === "traveling";
  const left = remainMs(shown, now);
  const door = !traveling && atDoor(shown);
  const catSrc = traveling ? "" : getCatSrc(shown, now);
  return {
    food: shown.food,
    water: shown.water,
    traveling,
    canFeed: canFeed(shown),
    statusText: getStatusText(shown),
    showStatusBar: door,
    sleeping: !traveling && shown.activity === "sleep",
    sleepFrames: spriteList(shown.breed, sleepNamesOf(shown.breed)),
    eating: !traveling && busyWithMeal(shown),
    meal: !traveling && busyWithMeal(shown) ? shown.activity : "",
    eatFrames: spriteList(shown.breed, EAT_NAMES),
    idling:
      !traveling &&
      (shown.activity === "idle" || shown.activity === "hungry"),
    idleFrames: spriteList(shown.breed, IDLE_FRAME_NAMES),
    catSrc,
    catPoseKey: catSrc ? [catSrc] : [],
    catPlace: door ? "cat-door" : "cat-near",
    showBag: !traveling,
    foodBowlSrc: getBowlSrc("food", shown.food),
    waterBowlSrc: getBowlSrc("water", shown.water),
    hasUnreadCard: shown.hasUnreadCard,
    remainText: traveling ? formatRemain(left) : "",
    awayText: traveling ? formatAway(shown, now) : "",
    travelOutText: traveling ? formatTravelOut(shown) : "",
    statusRemainText: formatRemain(statusRemainMs(shown, now)),
    showFeedHint: emptyTooLong(shown, now),
    leafCount: Math.max(0, Math.floor(Number(shown.leafCount) || 0)),
    planters: viewPlanters(shown.planters),
  };
}

module.exports = {
  MINUTE_MS,
  HOUR_MS,
  DAY_MS,
  TRAVEL_DURATION_MS: LEGACY_TRAVEL_DURATION_MS,
  TRAVEL_MAX_MS,
  SLEEP_DURATION_MS: SLEEP_MIN_MS,
  SLEEP_MIN_MS,
  SLEEP_MAX_MS,
  IDLE_MIN_MS,
  IDLE_MAX_MS,
  IDLE_ART_MIN_MS,
  IDLE_ART_MAX_MS,
  WAIT_MIN_MS,
  WAIT_MAX_MS,
  DECIDE_MIN_MS,
  DECIDE_MAX_MS,
  TRAVEL_CHANCE,
  JOURNAL_BRING_DIVISOR,
  FORGOT_KIND,
  EMPTY_HUNGRY_MS,
  WELCOME_HOLD_MS,
  RELIEF_MEAL_DELAY_MS,
  RELIEF_MEAL_AMOUNTS,
  FEED_CAP_G,
  FEED_LEAF_COST,
  MID_SUPPLY_G,
  HIGH_SUPPLY_G,
  PLANTER_COUNT,
  LEAF_BATCH,
  LEAF_CAP,
  GROW_MIN_MS,
  GROW_MAX_MS,
  LEAF_STOCK_EPOCH,
  MEAL_CHANCE,
  MEAL_CONSUME_MIN_G,
  MEAL_CONSUME_MAX_G,
  DRINK_CHECK_MIN_MS,
  DRINK_CHECK_MAX_MS,
  EAT_CHECK_MIN_MS,
  EAT_CHECK_MAX_MS,
  LOW_TRAVEL_MIN_MS,
  LOW_TRAVEL_MAX_MS,
  MID_TRAVEL_MIN_MS,
  MID_TRAVEL_MAX_MS,
  HIGH_TRAVEL_MIN_MS,
  HIGH_TRAVEL_MAX_MS,
  DEFAULT_NICKNAME,
  NICKNAME_MAX,
  BREEDS,
  breedSpec,
  spriteSrc,
  cardImageFileID,
  presentCard,
  sanitizeNickname,
  nicknameIssue,
  sanitizeBreed,
  readProfilePatch,
  applyProfile,
  SLEEP_FRAMES,
  SLEEP_FRAME_MS,
  EAT_FRAME_MS,
  EAT_SRC,
  IDLE_FRAME_MS,
  IDLE_ARTS,
  TICK_GUARD,
  usesLoopFrames,
  PORTION_G,
  TRIPS,
  toPlayerDoc,
  lastTemplateId,
  findTrip,
  createState,
  holdForTutorial,
  completeTutorial,
  normalize,
  isReady,
  canFeed,
  feedBlockedByLeaves,
  emptyTooLong,
  canDepart,
  atDoor,
  getStatusText,
  getCatSrc,
  getBowlSrc,
  feed,
  planterArt,
  growPlanters,
  harvestPlanter,
  commitHarvest,
  depart,
  tick,
  clearUnread,
  markCardRead,
  adjustUnread,
  viewModel,
  formatRemain,
  formatAway,
  statusRemainMs,
  formatDateTime,
  formatListDateTime,
  cardListTime,
  sortCardsByListDate,
  pickTrip,
  bringsJournal,
  journalBand,
  isForgotCard,
  cardId,
  makeCard,
  makeForgotCard,
  applyActivity,
  pickNextActivity,
  travelBand,
  pickTravelDuration,
  travelCost,
  tryTravelAt,
  welcomeHome,
  setRandom,
};
