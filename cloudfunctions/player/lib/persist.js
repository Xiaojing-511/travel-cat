const game = require("../utils/game.js");

function clampStock(value) {
  const n = Number(value) || 0;
  if (n < 0) return 0;
  if (n > game.FEED_CAP_G) return game.FEED_CAP_G;
  return n;
}

function shapePlayer(row) {
  const doc = game.toPlayerDoc(row || {});
  return {
    ...doc,
    rev: Number(row && row.rev) || 1,
    userId: (row && (row._id || row.userId)) || "",
    lastSeenAt: Number(row && row.lastSeenAt) || 0,
    lastHiddenAt: Number(row && row.lastHiddenAt) || 0,
    lastAdvancedAt: Number(row && row.lastAdvancedAt) || 0,
  };
}

function sanitizeSeed(raw) {
  if (!raw || typeof raw !== "object") return null;
  const cards = Array.isArray(raw.collectedCards) ? raw.collectedCards : [];
  return {
    food: clampStock(raw.food),
    water: clampStock(raw.water),
    hasUnreadCard: !!raw.hasUnreadCard,
    collectedCards: cards.filter((item) => item && typeof item === "object"),
  };
}

function isMissingDoc(err) {
  const message = String((err && err.message) || err || "");
  return (
    message.indexOf("does not exist") >= 0 ||
    message.indexOf("not exist") >= 0 ||
    message.indexOf("cannot find document") >= 0
  );
}

async function getPlayer(db, userId) {
  if (!userId) return null;
  try {
    const res = await db.collection("players").doc(userId).get();
    return res.data || null;
  } catch (err) {
    if (isMissingDoc(err)) return null;
    throw err;
  }
}

async function createPlayer(db, userId, state, now) {
  const data = {
    ...game.toPlayerDoc(state),
    userId,
    rev: 1,
    createdAt: Number(state.createdAt) || now,
    lastSeenAt: now,
    lastHiddenAt: 0,
    lastAdvancedAt: now,
  };
  await db.collection("players").doc(userId).set({
    data,
  });
  return shapePlayer({ ...data, _id: userId });
}

async function savePlayer(db, userId, expectedRev, state, now, extra) {
  const current = await getPlayer(db, userId);
  if (!current) {
    const err = new Error("NOT_FOUND");
    err.code = "NOT_FOUND";
    throw err;
  }
  if ((Number(current.rev) || 0) !== (Number(expectedRev) || 0)) {
    const err = new Error("REV_CONFLICT");
    err.code = "REV_CONFLICT";
    throw err;
  }
  const nextRev = (Number(expectedRev) || 0) + 1;
  const data = {
    ...game.toPlayerDoc(state),
    userId,
    rev: nextRev,
    lastSeenAt: now,
    lastAdvancedAt: now,
    ...(extra || {}),
  };
  await db.collection("players").doc(userId).update({
    data,
  });
  return shapePlayer({ ...data, _id: userId });
}

async function touchHidden(db, userId, now) {
  try {
    await db.collection("players").doc(userId).update({
      data: {
        lastHiddenAt: now,
        lastSeenAt: now,
      },
    });
  } catch (err) {
    if (isMissingDoc(err)) return;
    throw err;
  }
}

module.exports = {
  clampStock,
  shapePlayer,
  sanitizeSeed,
  getPlayer,
  createPlayer,
  savePlayer,
  touchHidden,
};
