function cardDoc(userId, card, now) {
  return {
    _id: String(card.id || `${card.collectedAt || now}-${Math.random().toString(36).slice(2, 8)}`),
    userId,
    templateId: card.templateId || "",
    location: card.location || "",
    journal: card.journal || "",
    image: card.image || "",
    imageFileID: card.imageFileID || "",
    startedAt: Number(card.startedAt) || 0,
    journaledAt: Number(card.journaledAt) || 0,
    collectedAt: Number(card.collectedAt) || 0,
    createdAt: now,
  };
}

async function insertCards(db, userId, cards, now) {
  const list = Array.isArray(cards) ? cards : [];
  let wrote = 0;
  for (let i = 0; i < list.length; i++) {
    const data = cardDoc(userId, list[i], now);
    try {
      await db.collection("cards").add({ data });
      wrote += 1;
    } catch (err) {
      const message = String((err && err.message) || err || "");
      if (message.indexOf("duplicate") < 0 && message.indexOf("UNIQUE") < 0) {
        try {
          await db.collection("cards").doc(data._id).get();
        } catch (missing) {
          throw err;
        }
      }
    }
  }
  return wrote;
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
  const cards = (res.data || []).map((row) => ({
    id: row._id,
    templateId: row.templateId,
    location: row.location,
    journal: row.journal,
    image: row.image,
    imageFileID: row.imageFileID,
    startedAt: row.startedAt,
    journaledAt: row.journaledAt,
    collectedAt: row.collectedAt,
  }));
  return {
    cards,
    nextCursor: cards.length === size ? skip + size : null,
  };
}

module.exports = {
  cardDoc,
  insertCards,
  listCards,
};
