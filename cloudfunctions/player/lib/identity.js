async function findUser(db, openid) {
  const found = await db.collection("users").where({ openid }).limit(1).get();
  if (found.data && found.data[0]) return found.data[0];
  return null;
}

async function resolveUser(db, openid, appid, now) {
  const existing = await findUser(db, openid);
  if (existing) {
    return { userId: existing._id, isNew: false };
  }
  try {
    const added = await db.collection("users").add({
      data: {
        openid,
        appid: appid || "",
        createdAt: now,
      },
    });
    return { userId: added._id, isNew: true };
  } catch (err) {
    const again = await findUser(db, openid);
    if (again) return { userId: again._id, isNew: false };
    throw err;
  }
}

module.exports = {
  findUser,
  resolveUser,
};
