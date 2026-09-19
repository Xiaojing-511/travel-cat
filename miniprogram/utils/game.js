const TRIPS = require("../data/trips.js");

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const PORTION_G = 10;
const FEED_CAP_G = 50;
const MEAL_CHANCE = 1 / 3;
const TRAVEL_CHANCE = 2 / 3;
const MEAL_CONSUME_MIN_G = 5;
const MEAL_CONSUME_MAX_G = 10;

const SLEEP_MIN_MS = 5 * MINUTE_MS;
const SLEEP_MAX_MS = 30 * MINUTE_MS;
const IDLE_MIN_MS = 2 * MINUTE_MS;
const IDLE_MAX_MS = 10 * MINUTE_MS;
const IDLE_ART_MIN_MS = 5 * MINUTE_MS;
const IDLE_ART_MAX_MS = 8 * MINUTE_MS;
const WAIT_MIN_MS = 10 * MINUTE_MS;
const WAIT_MAX_MS = 30 * MINUTE_MS;
const DECIDE_MIN_MS = 12 * 1000;
const DECIDE_MAX_MS = 25 * 1000;
const HUNGRY_MIN_MS = 10 * MINUTE_MS;
const HUNGRY_MAX_MS = 3 * HOUR_MS;
const EAT_MIN_MS = 2 * MINUTE_MS;
const EAT_MAX_MS = 5 * MINUTE_MS;
const DRINK_MIN_MS = 1 * MINUTE_MS;
const DRINK_MAX_MS = 3 * MINUTE_MS;

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
const LOW_TRAVEL_MAX_MS = 6 * HOUR_MS;
const MID_TRAVEL_MIN_MS = 1 * HOUR_MS;
const MID_TRAVEL_MAX_MS = 12 * HOUR_MS;
const HIGH_TRAVEL_MIN_MS = 2 * HOUR_MS;
const HIGH_TRAVEL_MAX_MS = 24 * HOUR_MS;
const LEGACY_TRAVEL_DURATION_MS = 5 * MINUTE_MS;

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
const SLEEP_FRAMES = [
  "/images/cat/sleep/001.png",
  "/images/cat/sleep/002.png",
  "/images/cat/sleep/003.png",
];
const EAT_FRAMES = [
  "/images/cat/eat/001.png",
  "/images/cat/eat/002.png",
  "/images/cat/eat/003.png",
];
const IDLE_ARTS = [
  "/images/cat/lie-1.png",
  "/images/cat/lie-2.png",
  "/images/cat/lie-bag.png",
  "/images/cat/stand-bag.png",
  "/images/cat/stand.png",
];
const SLEEP_FRAME_MS = 1000;
const SLEEP_SEQUENCE = [0, 1, 2, 1];
const EAT_FRAME_MS = 1000;
const EAT_SEQUENCE = [0, 1, 2, 1];
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

function migrateIdleArt(raw) {
  const n = Number(raw && raw.idleArt);
  if (Number.isFinite(n)) {
    const i = Math.floor(n);
    if (i >= 0 && i < IDLE_ARTS.length) return i;
  }
  if (raw && raw.idleKind === "stand") return 4;
  if (raw && Number(raw.poseVariant) === 1) return 1;
  return 0;
}

function applyActivity(state, activity, now, durationMs) {
  const ms = durationMs == null ? durationOf(activity) : durationMs;
  const idle = activity === "idle";
  return {
    ...state,
    activity,
    activityStartedAt: now,
    activityEndAt: now + Math.max(1, ms),
    poseVariant: Math.floor(rand() * 2),
    idleKind: rand() < 0.5 ? "stand" : "lie",
    idleArt: idle ? pickIdleArt() : migrateIdleArt(state),
    nextIdleArtAt: idle ? now + idleArtDuration() : 0,
  };
}

function maybeSwitchIdleArt(state, now) {
  if (state.status === "traveling" || state.activity !== "idle") {
    return state;
  }
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

function createState(now) {
  const t = now || Date.now();
  const base = scheduleNeedChecks(
    {
      food: 0,
      water: 0,
      status: "home",
      travelId: "",
      travelEndAt: 0,
      travelStartedAt: 0,
      lastTravelAt: 0,
      nextTravelCheckAt: scheduleTravelCheck(t),
      hasUnreadCard: false,
      lastCardTemplateId: "",
      cardCount: 0,
      collectedCards: [],
      createdAt: t,
      emptySince: t,
    },
    t,
  );
  return applyActivity(
    base,
    pickNextActivity({ activity: "", food: 0, water: 0, emptySince: t }, t),
    t,
  );
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
  ).map((card) => enrichCard(card, tripById));
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
    lastTravelAt: Number(raw.lastTravelAt) || 0,
    nextTravelCheckAt: Number(raw.nextTravelCheckAt) || scheduleTravelCheck(t),
    hasUnreadCard: !!raw.hasUnreadCard,
    lastCardTemplateId: String(
      raw.lastCardTemplateId ||
        (collectedCards[0] && collectedCards[0].templateId) ||
        "",
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
  };
  return merged;
}

function isReady(state) {
  return state.food >= PORTION_G && state.water >= PORTION_G;
}

function canFeed(state) {
  return state.food < FEED_CAP_G || state.water < FEED_CAP_G;
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

function getSleepSrc(now, startedAt) {
  return getLoopSrc(
    SLEEP_FRAMES,
    SLEEP_SEQUENCE,
    SLEEP_FRAME_MS,
    now,
    startedAt,
  );
}

function getEatSrc(now, startedAt) {
  return getLoopSrc(EAT_FRAMES, EAT_SEQUENCE, EAT_FRAME_MS, now, startedAt);
}

function usesLoopFrames(state) {
  return state.activity === "sleep" || state.activity === "eat";
}

function getCatSrc(state, now) {
  const variant = state.poseVariant % 2;
  if (state.activity === "sleep") {
    return getSleepSrc(now, state.activityStartedAt);
  }
  if (atDoor(state)) return `/images/cat/wait-${variant + 1}.png`;
  if (state.activity === "eat") {
    return getEatSrc(now, state.activityStartedAt);
  }
  if (state.activity === "idle") {
    const i = migrateIdleArt(state);
    return IDLE_ARTS[i];
  }
  if (state.idleKind === "stand") return "/images/cat/stand.png";
  return `/images/cat/lie-${variant + 1}.png`;
}

function getBowlSrc(kind, grams) {
  if (kind === "food") {
    return grams > 0 ? "/images/bowl-food.png" : "/images/bowl-food-empty.png";
  }
  return grams > 0 ? "/images/bowl-water.png" : "/images/bowl-water-empty.png";
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
  if (kind === "eat") {
    next = { ...next, food: Math.max(0, next.food - consume) };
  } else {
    next = { ...next, water: Math.max(0, next.water - consume) };
  }
  next = syncEmptySince(next, at);
  next = applyActivity(next, kind, at);
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
  if (!canFeed(state)) return state;
  const t = now == null ? Date.now() : now;
  const thank = shouldScheduleReliefMeal(state, t);
  let next = {
    ...state,
    food: Math.min(FEED_CAP_G, state.food + PORTION_G),
    water: Math.min(FEED_CAP_G, state.water + PORTION_G),
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

function travelBand(state) {
  if (state.food >= 20 && state.water >= 20) return "high";
  if (state.food >= PORTION_G && state.water >= PORTION_G) return "mid";
  return "low";
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

function lastTemplateId(source) {
  if (!source) return "";
  if (Array.isArray(source)) {
    return (source[0] && source[0].templateId) || "";
  }
  if (source.lastCardTemplateId) return source.lastCardTemplateId;
  const cards = source.collectedCards;
  return (cards && cards[0] && cards[0].templateId) || "";
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

function pickTrip(source, templates) {
  const list = templates && templates.length ? templates : TRIPS;
  const withPhoto = list.filter(tripHasArt);
  const candidates = withPhoto.length ? withPhoto : list;
  const lastId = lastTemplateId(source);
  const pool = lastId
    ? candidates.filter((item) => item.id !== lastId)
    : candidates;
  const sourceList = pool.length ? pool : candidates;
  return sourceList[Math.floor(rand() * sourceList.length)];
}

function pad2(n) {
  return n < 10 ? "0" + n : String(n);
}

function formatDateTime(ts) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
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

function enrichCard(card, tripById) {
  if (!card || typeof card !== "object") return card;
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
  if (
    template &&
    template.imageFileID &&
    card.imageFileID !== template.imageFileID
  ) {
    next.imageFileID = template.imageFileID;
  }
  if (template && template.image && card.image !== template.image) {
    next.image = template.image;
  }
  return next;
}

function makeCard(template, now, trip) {
  const endedAt =
    trip && trip.endedAt != null ? Number(trip.endedAt) : Number(now) || 0;
  const startedAt =
    trip && trip.startedAt != null
      ? Number(trip.startedAt)
      : endedAt - LEGACY_TRAVEL_DURATION_MS;
  const id = `${endedAt}-${Math.random().toString(36).slice(2, 8)}`;
  const span = Math.max(1, endedAt - startedAt);
  const journaledAt = startedAt + Math.floor(rand() * span);
  return {
    id,
    templateId: template.id,
    location: template.location,
    image: template.image || "",
    imageFileID: template.imageFileID || "",
    journal: template.journal,
    collectedAt: endedAt,
    startedAt,
    journaledAt,
  };
}

function completeTravel(state, now, templates, opts) {
  const endedAt = state.travelEndAt > 0 ? state.travelEndAt : now;
  const startedAt =
    state.travelStartedAt > 0
      ? state.travelStartedAt
      : endedAt - LEGACY_TRAVEL_DURATION_MS;
  const locked = findTrip(state.travelId, templates);
  const template = locked || pickTrip(state, templates);
  const card = makeCard(template, endedAt, {
    startedAt,
    endedAt,
  });
  const prevCount = Number(state.cardCount);
  const home = {
    ...state,
    status: "home",
    travelId: "",
    travelEndAt: 0,
    travelStartedAt: 0,
    hasUnreadCard: true,
    lastCardTemplateId: card.templateId,
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
  const minutes = Math.max(0, Math.floor((now - start) / MINUTE_MS));
  return `已出门 ${minutes} 分钟`;
}

function switchHome(state, now, opts, templates) {
  const willTravel =
    state.activity === "decide" && shouldTravelFromDecide(state);
  const next = {
    ...state,
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
  const consume = pickMealConsume(state.water);
  next = {
    ...next,
    water: Math.max(0, state.water - consume),
  };
  next = syncEmptySince(next, at);
  return applyActivity(next, "drink", at);
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
  const consume = pickMealConsume(state.food);
  next = {
    ...next,
    food: Math.max(0, state.food - consume),
  };
  next = syncEmptySince(next, at);
  return applyActivity(next, "eat", at);
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
  const posed = maybeSwitchIdleArt(current, now);
  if (posed !== current) {
    current = posed;
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
    lastTravelAt: Number(state.lastTravelAt) || 0,
    emptySince: Number(state.emptySince) || 0,
    nextDrinkCheckAt: Number(state.nextDrinkCheckAt) || 0,
    nextEatCheckAt: Number(state.nextEatCheckAt) || 0,
    reliefMealAt: Number(state.reliefMealAt) || 0,
    idleArt: migrateIdleArt(state),
    idleKind: state.idleKind === "stand" ? "stand" : "lie",
    poseVariant: Number(state.poseVariant) === 1 ? 1 : 0,
    nextIdleArtAt: Number(state.nextIdleArtAt) || 0,
    hasUnreadCard: !!state.hasUnreadCard,
    lastCardTemplateId: String(
      state.lastCardTemplateId || lastTemplateId(state) || "",
    ),
    cardCount: Number(state.cardCount) || collected.length,
    createdAt: Number(state.createdAt) || 0,
  };
}

function clearUnread(state) {
  if (!state.hasUnreadCard) return state;
  return { ...state, hasUnreadCard: false };
}

function viewModel(state, now) {
  const traveling = state.status === "traveling";
  const left = remainMs(state, now);
  const door = !traveling && atDoor(state);
  return {
    food: state.food,
    water: state.water,
    traveling,
    canFeed: canFeed(state),
    statusText: getStatusText(state),
    sleeping: !traveling && state.activity === "sleep",
    sleepFrames: SLEEP_FRAMES,
    eating: !traveling && state.activity === "eat",
    eatFrames: EAT_FRAMES,
    catSrc: traveling ? "" : getCatSrc(state, now),
    catPlace: door ? "cat-door" : "cat-near",
    foodBowlSrc: getBowlSrc("food", state.food),
    waterBowlSrc: getBowlSrc("water", state.water),
    hasUnreadCard: state.hasUnreadCard,
    remainText: traveling ? formatRemain(left) : "",
    awayText: traveling ? formatAway(state, now) : "",
    statusRemainText: formatRemain(statusRemainMs(state, now)),
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
  EMPTY_HUNGRY_MS,
  WELCOME_HOLD_MS,
  RELIEF_MEAL_DELAY_MS,
  RELIEF_MEAL_AMOUNTS,
  FEED_CAP_G,
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
  SLEEP_FRAMES,
  SLEEP_FRAME_MS,
  EAT_FRAMES,
  EAT_FRAME_MS,
  IDLE_ARTS,
  TICK_GUARD,
  usesLoopFrames,
  PORTION_G,
  TRIPS,
  toPlayerDoc,
  lastTemplateId,
  findTrip,
  createState,
  normalize,
  isReady,
  canFeed,
  canDepart,
  atDoor,
  getStatusText,
  getCatSrc,
  getBowlSrc,
  feed,
  depart,
  tick,
  clearUnread,
  viewModel,
  formatRemain,
  formatAway,
  statusRemainMs,
  formatDateTime,
  pickTrip,
  makeCard,
  applyActivity,
  pickNextActivity,
  travelBand,
  pickTravelDuration,
  travelCost,
  tryTravelAt,
  welcomeHome,
  setRandom,
};
