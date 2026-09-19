const game = require("./game.js");
const clock = require("./clock.js");
const cloud = require("./cloud.js");
const reviewCards = require("../data/review-cards.js");

const CACHE_KEY = "travel_cat_cache_v1";
const CARDS_KEY = "travel_cat_cards_cache_v1";
const LEGACY_KEY = "travel_cat_state_v1";
const LEFT_KEY = "travel_cat_has_left";

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

async function login() {
  const seed = readLegacySeed();
  const result = await cloud.call("login", seed ? { localSeed: seed } : {});
  if (!result.ok) return offlineResult(result);
  cachePlayer(result);
  if (result.isNew && seed) {
    removeKey(LEGACY_KEY);
    removeKey(LEFT_KEY);
  }
  return result;
}

async function callPlayer(action, data, extras) {
  const cache = loadCache() || {};
  const payload = Object.assign({}, data || {}, {
    rev: cache.player && cache.player.rev,
  });
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

async function sync(opts) {
  const payload = { enteringApp: !!(opts && opts.enteringApp) };
  const extras = { completed: false, welcomeBack: false, changed: false };
  let result = await callPlayer("sync", payload, extras);
  if (result.code === "REV_CONFLICT") {
    result = await callPlayer("sync", payload, extras);
  }
  return result;
}

function feed() {
  return callPlayer("feed", {}, { completed: false, changed: false });
}

function welcomeHome() {
  return callPlayer("welcomeHome", {}, { changed: false });
}

function clearUnread() {
  return callPlayer("clearUnread", {}, { completed: false, changed: false });
}

async function listCards(opts) {
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
  welcomeHome,
  clearUnread,
  listCards,
  hide,
  hasPriorSession,
  load,
  save,
  markLeft,
};
