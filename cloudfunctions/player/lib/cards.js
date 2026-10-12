const game = require("../utils/game.js");

function isMissingDoc(err) {
  const message = String((err && err.message) || err || "");
  return (
    message.indexOf("does not exist") >= 0 ||
    message.indexOf("not exist") >= 0 ||
    message.indexOf("cannot find document") >= 0
  );
}

function isDuplicate(err) {
  const message = String((err && err.message) || err || "");
  return message.indexOf("duplicate") >= 0 || message.indexOf("UNIQUE") >= 0;
}

function cardDocId(userId, card, now) {
  const uid = String(userId || "");
  const key = String(
    (card && card.id) ||
      game.cardId(
        card && card.startedAt,
        (card && (card.collectedAt || card.endedAt)) || now,
        card && card.templateId
      )
  );
  if (!uid) return key;
  const prefix = uid + "_";
  if (key.indexOf(prefix) === 0) return key;
  return prefix + key;
}

function cardDoc(userId, card, now) {
  return {
    _id: cardDocId(userId, card, now),
    userId,
    kind: card.kind === "forgot" ? "forgot" : "",
    templateId: card.templateId || "",
    location: card.location || "",
    journal: card.journal || "",
    image: card.image || "",
    imageFileID: card.imageFileID || "",
    startedAt: Number(card.startedAt) || 0,
    journaledAt: Number(card.journaledAt) || 0,
    collectedAt: Number(card.collectedAt) || 0,
    createdAt: now,
    unread: card.unread === true,
  };
}

async function insertOne(db, data) {
  const id = data._id;
  const fields = Object.assign({}, data);
  delete fields._id;
  const doc = db.collection("cards").doc(id);
  try {
    const existing = await doc.get();
    if (existing && existing.data) return false;
  } catch (err) {
    if (!isMissingDoc(err)) throw err;
  }
  try {
    await doc.set({ data: fields });
    return true;
  } catch (err) {
    if (isDuplicate(err)) return false;
    try {
      await doc.get();
      return false;
    } catch (missing) {
      throw err;
    }
  }
}

async function insertCards(db, userId, cards, now) {
  const list = Array.isArray(cards) ? cards : [];
  let unread = 0;
  for (let i = 0; i < list.length; i++) {
    const created = await insertOne(db, cardDoc(userId, list[i], now));
    if (created && list[i] && list[i].unread) unread += 1;
  }
  return unread;
}

async function listCards(db, userId, limit, cursor) {
  const size = Math.min(100, Math.max(1, Number(limit) || 50));
  const skip = Math.max(0, Number(cursor) || 0);
  const res = await db
    .collection("cards")
    .where({ userId })
    .orderBy("collectedAt", "desc")
    .skip(skip)
    .limit(size)
    .get();
  const cards = game.sortCardsByListDate(
    (res.data || []).map((row) => ({
      id: row._id,
      kind: row.kind === "forgot" ? "forgot" : "",
      templateId: row.templateId,
      location: row.location,
      journal: row.journal,
      image: row.image,
      imageFileID: row.imageFileID,
      startedAt: row.startedAt,
      journaledAt: row.journaledAt,
      collectedAt: row.collectedAt,
      unread: row.unread === true,
    }))
  );
  return {
    cards,
    nextCursor: cards.length === size ? skip + size : null,
  };
}

async function markRead(db, userId, cardId) {
  const id = String(cardId || "");
  const prefix = String(userId || "") + "_";
  if (!id || id.indexOf(prefix) !== 0) return "missing";
  const doc = db.collection("cards").doc(id);
  try {
    const existing = await doc.get();
    const data = existing && existing.data;
    if (!data || data.userId !== userId) return "missing";
    if (!data.unread) return "read";
    await doc.update({ data: { unread: false } });
    return "updated";
  } catch (err) {
    if (isMissingDoc(err)) return "missing";
    throw err;
  }
}

module.exports = {
  cardDocId,
  cardDoc,
  insertCards,
  listCards,
  markRead,
};
