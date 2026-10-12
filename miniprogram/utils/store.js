const game = require("./game.js");
const clock = require("./clock.js");
const cloud = require("./cloud.js");
const reviewCards = require("../data/review-cards.js");

const CACHE_KEY = "travel_cat_cache_v1";
const CARDS_KEY = "travel_cat_cards_cache_v1";
const LEGACY_KEY = "travel_cat_state_v1";
const LEFT_KEY = "travel_cat_has_left";

let playerQueue = Promise.resolve();

function runPlayer(task) {
  const run = playerQueue.then(task, task);
  playerQueue = run.then(
    function () {},
    function () {}
  );
  return run;
}

function readJson(key) {
  try {
    const value = wx.getStorageSync(key);
    return value && typeof value === "object" ? value : null;
  } catch (e) {
    return null;
  }
}

function writeJson(key, value) {
  try {
    wx.setStorageSync(key, value);
  } catch (e) {
    console.error("cache write failed", key, e);
  }
}

function removeKey(key) {
  try {
    wx.removeStorageSync(key);
  } catch (e) {}
}

function loadCache() {
  return readJson(CACHE_KEY);
}

function saveCache(payload) {
  writeJson(CACHE_KEY, payload);
  if (payload && payload.serverNow) clock.setServerNow(payload.serverNow);
}

function cachePlayer(result) {
  if (!result || !result.ok || !result.player) return result;
  const prev = loadCache() || {};
  saveCache({
    userId: result.userId || prev.userId,
    player: result.player,
    serverNow: result.serverNow,
  });
  return result;
}

function offlineResult(result, extras) {
  const cache = loadCache() || {};
  return Object.assign(
    {
      ok: false,
      offline: true,
      player: cache.player || null,
      userId: cache.userId || "",
      serverNow: cache.serverNow || 0,
    },
    extras || {},
    result || {}
  );
}

function readLegacySeed() {
  const saved = readJson(LEGACY_KEY);
  if (!saved) return null;
  return {
    food: saved.food,
    water: saved.water,
    hasUnreadCard: !!saved.hasUnreadCard,
    collectedCards: Array.isArray(saved.collectedCards) ? saved.collectedCards : [],
  };
}

function login() {
  return runPlayer(async () => {
    const seed = readLegacySeed();
    const result = await cloud.call("login", seed ? { localSeed: seed } : {});
    if (!result.ok) return offlineResult(result);
    cachePlayer(result);
    if (result.isNew && seed) {
      removeKey(LEGACY_KEY);
      removeKey(LEFT_KEY);
    }
    return result;
  });
}

async function callPlayer(action, data, extras) {
  const cache = loadCache() || {};
  const rev = cache.player && cache.player.rev;
  const payload = Object.assign({}, data || {});
  if (Number.isFinite(Number(rev)) && rev !== "" && rev != null) {
    payload.rev = Number(rev);
  }
  const result = await cloud.call(action, payload);
  if (result.ok) return cachePlayer(result);
  if (result.player && result.serverNow) {
    cachePlayer({
      ok: true,
      userId: result.userId,
      player: result.player,
      serverNow: result.serverNow,
    });
  }
  if (result.code === "NETWORK" || result.code === "INTERNAL" || !result.code) {
    return offlineResult(result, extras);
  }
  return Object.assign({ offline: false }, extras || {}, result);
}

function sync(opts) {
  return runPlayer(async () => {
    const payload = { enteringApp: !!(opts && opts.enteringApp) };
    const extras = { completed: false, welcomeBack: false, changed: false };
    let result = await callPlayer("sync", payload, extras);
    if (result.code === "REV_CONFLICT") {
      result = await callPlayer("sync", payload, extras);
    }
    return result;
  });
}

function feed() {
  return runPlayer(() =>
    callPlayer("feed", {}, { completed: false, changed: false })
  );
}

function harvestPlanter(planterId, seenLeaves) {
  return runPlayer(async () => {
    const extras = { completed: false, changed: false };
    const payload = { planterId, seenLeaves };
    let result = await callPlayer("harvestPlanter", payload, extras);
    if (result.code === "REV_CONFLICT") {
      result = await callPlayer("harvestPlanter", payload, extras);
    }
    return result;
  });
}

function welcomeHome() {
  return runPlayer(() => callPlayer("welcomeHome", {}, { changed: false }));
}

function clearUnread() {
  return runPlayer(() =>
    callPlayer("clearUnread", {}, { completed: false, changed: false })
  );
}

function readCard(cardId) {
  return runPlayer(async () => {
    const extras = { completed: false, changed: false };
    let result = await callPlayer("readCard", { cardId }, extras);
    if (result.code === "REV_CONFLICT") {
      result = await callPlayer("readCard", { cardId }, extras);
    }
    if (!result.ok) return result;
    const cached = readJson(CARDS_KEY);
    if (cached && Array.isArray(cached.cards)) {
      writeJson(CARDS_KEY, {
        ...cached,
        cards: cached.cards.map((card) =>
          card && card.id === cardId ? { ...card, unread: false } : card,
        ),
      });
    }
    return result;
  });
}

function completeTutorial() {
  return runPlayer(async () => {
    const extras = { changed: false };
    let result = await callPlayer("completeTutorial", {}, extras);
    if (result.code === "REV_CONFLICT") {
      result = await callPlayer("completeTutorial", {}, extras);
    }
    return result;
  });
}

function updateProfile(patch) {
  return runPlayer(async () => {
    const extras = { completed: false };
    let completed = false;
    let result = await callPlayer("updateProfile", patch, extras);
    for (let attempt = 0; result.code === "REV_CONFLICT" && attempt < 2; attempt++) {
      const synced = await callPlayer("sync", { enteringApp: false }, {
        completed: false,
        welcomeBack: false,
        changed: false,
      });
      if (synced && synced.completed) completed = true;
      result = await callPlayer("updateProfile", patch, extras);
    }
    if (completed && result && result.ok) result.completed = true;
    return result;
  });
}

function listCards(opts) {
  return runPlayer(async () => {
    const result = await cloud.call("listCards", {
      limit: opts && opts.limit,
      cursor: opts && opts.cursor,
    });
    if (result.ok) {
      writeJson(CARDS_KEY, {
        cards: result.cards || [],
        serverNow: result.serverNow,
      });
      if (result.serverNow) clock.setServerNow(result.serverNow);
      return Object.assign({}, result, {
        cards: reviewCards.withReviewFallback(result.cards, result.serverNow),
      });
    }
    const cached = readJson(CARDS_KEY) || { cards: [] };
    return {
      ok: false,
      offline: true,
      cards: reviewCards.withReviewFallback(cached.cards, cached.serverNow),
      nextCursor: null,
      serverNow: cached.serverNow || 0,
      code: result.code,
    };
  });
}

function loadCardsCache() {
  const cached = readJson(CARDS_KEY);
  return reviewCards.withReviewFallback((cached && cached.cards) || []);
}

function hide() {
  return cloud.call("hide", {});
}

function hasPriorSession() {
  const cache = loadCache();
  if (cache && (cache.userId || cache.player)) return true;
  try {
    if (wx.getStorageSync(LEFT_KEY)) return true;
    const saved = wx.getStorageSync(LEGACY_KEY);
    return !!(saved && typeof saved === "object");
  } catch (e) {
    return false;
  }
}

function load() {
  const cache = loadCache();
  if (cache && cache.player) {
    return game.normalize(cache.player, clock.approxNow());
  }
  return game.normalize(readJson(LEGACY_KEY), clock.approxNow());
}

function save(state) {
  const cache = loadCache() || {};
  saveCache({
    userId: cache.userId || "",
    player: Object.assign({}, cache.player || {}, game.toPlayerDoc(state), {
      rev: cache.player && cache.player.rev,
    }),
    serverNow: cache.serverNow || clock.approxNow(),
  });
  return state;
}

function markLeft() {
  hide();
}

module.exports = {
  loadCache,
  loadCardsCache,
  login,
  sync,
  feed,
  harvestPlanter,
  welcomeHome,
  clearUnread,
  readCard,
  completeTutorial,
  updateProfile,
  listCards,
  hide,
  hasPriorSession,
  load,
  save,
  markLeft,
};
