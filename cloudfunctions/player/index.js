const cloud = require("wx-server-sdk");
const game = require("./utils/game.js");
const identity = require("./lib/identity.js");
const persist = require("./lib/persist.js");
const cards = require("./lib/cards.js");
const { advance } = require("./lib/advance.js");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const COLLECTIONS = ["users", "players", "cards"];

function ok(action, payload) {
  return {
    ok: true,
    action,
    ...(payload || {}),
  };
}

function fail(code, message, extra) {
  return {
    ok: false,
    code,
    message: message || code,
    ...(extra || {}),
  };
}

function contextId() {
  const wxContext = cloud.getWXContext();
  return {
    openid: wxContext.OPENID || "",
    appid: wxContext.APPID || "",
  };
}

async function requireUser(now) {
  const { openid, appid } = contextId();
  if (!openid) {
    const err = new Error("UNAUTHENTICATED");
    err.code = "UNAUTHENTICATED";
    throw err;
  }
  const resolved = await identity.resolveUser(db, openid, appid, now);
  return resolved;
}

async function requirePlayer(now) {
  const user = await requireUser(now);
  const row = await persist.getPlayer(db, user.userId);
  if (!row) {
    const err = new Error("NOT_FOUND");
    err.code = "NOT_FOUND";
    throw err;
  }
  return { userId: user.userId, row };
}

async function persistTick(userId, row, now, options, extraState) {
  const ticked = advance(row, now, options);
  let state = ticked.state;
  if (typeof extraState === "function") {
    state = extraState(state, ticked);
  }
  state = await storeNewCards(userId, state, ticked.newCards, now);
  const player = await persist.savePlayer(db, userId, row.rev, state, now);
  return {
    ticked,
    state,
    player,
  };
}

async function storeNewCards(userId, state, newCards, now) {
  const list = Array.isArray(newCards) ? newCards : [];
  if (!list.length) return state;
  const wanted = list.filter((card) => card && card.unread).length;
  const added = await cards.insertCards(db, userId, list, now);
  return game.adjustUnread(state, added - wanted);
}

async function ensureDb() {
  const created = [];
  for (let i = 0; i < COLLECTIONS.length; i++) {
    const name = COLLECTIONS[i];
    try {
      await db.createCollection(name);
      created.push(name);
    } catch (err) {
      created.push(name);
    }
  }
  return ok("ensureDb", { collections: created, serverNow: Date.now() });
}

async function login(event, now) {
  const user = await requireUser(now);
  const existing = await persist.getPlayer(db, user.userId);
  if (existing) {
    let row = existing;
    if (row.tutorialDone === false) {
      const released = game.completeTutorial(game.normalize(row, now), now);
      row = Object.assign({}, row, game.toPlayerDoc(released));
    }
    const saved = await persistTick(user.userId, row, now, {
      enteringApp: false,
    });
    return ok("login", {
      userId: user.userId,
      player: saved.player,
      serverNow: now,
      isNew: false,
    });
  }

  const seed = persist.sanitizeSeed(event && event.localSeed);
  let state = game.createState(now);
  if (seed) {
    state = {
      ...state,
      food: seed.food,
      water: seed.water,
      lastCardTemplateId: game.lastTemplateId(seed.collectedCards) || "",
      cardCount: seed.collectedCards.length,
    };
    if (state.food > 0 || state.water > 0) {
      state = { ...state, emptySince: 0 };
    }
    if (seed.collectedCards.length) {
      await cards.insertCards(db, user.userId, seed.collectedCards, now);
    }
  }
  if (user.isNew) state = game.holdForTutorial(state, now);
  const player = await persist.createPlayer(db, user.userId, state, now);
  return ok("login", {
    userId: user.userId,
    player,
    serverNow: now,
    isNew: !!user.isNew,
  });
}

async function sync(event, now) {
  const { userId, row } = await requirePlayer(now);
  const saved = await persistTick(userId, row, now, {
    enteringApp: !!(event && event.enteringApp),
  });
  return ok("sync", {
    userId,
    player: saved.player,
    serverNow: now,
    completed: saved.ticked.completed,
    welcomeBack: saved.ticked.welcomeBack,
    changed: saved.ticked.changed,
  });
}

async function feed(_event, now) {
  const { userId, row } = await requirePlayer(now);
  const ticked = advance(row, now, { enteringApp: false });
  if (game.feedBlockedByLeaves(ticked.state, now)) {
    if (ticked.newCards.length) {
      ticked.state = await storeNewCards(userId, ticked.state, ticked.newCards, now);
    }
    const player =
      ticked.changed || ticked.newCards.length
        ? await persist.savePlayer(db, userId, row.rev, ticked.state, now)
        : persist.shapePlayer(row);
    return fail("NEED_LEAVES", "need leaves", {
      userId,
      player,
      serverNow: now,
    });
  }
  let fed = game.feed(ticked.state, now);
  const changed = fed !== ticked.state || ticked.changed || ticked.newCards.length;
  if (!changed) {
    return fail("CANNOT_FEED", "cannot feed", {
      userId,
      player: persist.shapePlayer(row),
      serverNow: now,
    });
  }
  if (ticked.newCards.length) {
    fed = await storeNewCards(userId, fed, ticked.newCards, now);
  }
  const player = await persist.savePlayer(db, userId, row.rev, fed, now);
  return ok("feed", {
    userId,
    player,
    serverNow: now,
    completed: ticked.completed,
    changed: true,
  });
}

async function welcomeHome(_event, now) {
  const { userId, row } = await requirePlayer(now);
  const saved = await persistTick(userId, row, now, { enteringApp: false }, (state) =>
    game.welcomeHome(state, now)
  );
  return ok("welcomeHome", {
    userId,
    player: saved.player,
    serverNow: now,
    changed: saved.ticked.changed || saved.state !== saved.ticked.state,
  });
}

function profileFail(code, userId, row, now) {
  const extra = { userId, serverNow: now };
  if (row) {
    extra.player = persist.shapePlayer(
      Object.assign({}, row, game.toPlayerDoc(game.normalize(row, now)), {
        rev: row.rev,
        _id: row._id || userId,
      })
    );
  }
  return fail(code, code, extra);
}

async function updateProfile(event, now) {
  const user = await requireUser(now);
  const userId = user.userId;
  let row = await persist.getPlayer(db, userId);
  if (!row) {
    const created = game.holdForTutorial(game.createState(now), now);
    const parsed = game.readProfilePatch(event, created);
    if (!parsed.ok) return profileFail(parsed.code, userId, null, now);
    const player = await persist.createPlayer(
      db,
      userId,
      game.applyProfile(created, parsed.patch),
      now
    );
    return ok("updateProfile", {
      userId,
      player,
      serverNow: now,
      completed: false,
      changed: true,
    });
  }

  const current = game.normalize(row, now);
  const parsed = game.readProfilePatch(event, current);
  if (!parsed.ok) return profileFail(parsed.code, userId, row, now);

  let saved;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      saved = await persistTick(
        userId,
        row,
        now,
        { enteringApp: false },
        (state) => game.applyProfile(state, parsed.patch)
      );
      break;
    } catch (err) {
      if (!err || err.code !== "REV_CONFLICT" || attempt === 2) throw err;
      row = await persist.getPlayer(db, userId);
      if (!row) throw err;
    }
  }
  return ok("updateProfile", {
    userId,
    player: saved.player,
    serverNow: now,
    completed: saved.ticked.completed,
    changed: true,
  });
}

async function clearUnread(_event, now) {
  const { userId, row } = await requirePlayer(now);
  const saved = await persistTick(userId, row, now, { enteringApp: false }, (state) =>
    game.clearUnread(state)
  );
  return ok("clearUnread", {
    userId,
    player: saved.player,
    serverNow: now,
    completed: saved.ticked.completed,
    changed: true,
  });
}

async function harvestPlanter(event, now) {
  const planterId = Number(event && event.planterId);
  const { userId, row } = await requirePlayer(now);
  const storedPlanters = Array.isArray(row.planters) ? row.planters : [];
  const seenLeaves = event && event.seenLeaves;
  let didHarvest = false;
  const saved = await persistTick(
    userId,
    row,
    now,
    { enteringApp: false },
    (state) => {
      const picked = game.harvestPlanter(
        { ...state, planters: storedPlanters },
        planterId,
        now,
        seenLeaves
      );
      if (!picked) return state;
      didHarvest = true;
      return game.commitHarvest(state, picked, planterId, now);
    }
  );
  if (!didHarvest) {
    return fail("CANNOT_HARVEST", "cannot harvest", {
      userId,
      player: saved.player,
      serverNow: now,
    });
  }
  return ok("harvestPlanter", {
    userId,
    player: saved.player,
    serverNow: now,
    completed: saved.ticked.completed,
    changed: true,
  });
}

async function completeTutorial(_event, now) {
  const { userId, row } = await requirePlayer(now);
  const next = game.completeTutorial(game.normalize(row, now), now);
  const player = await persist.savePlayer(db, userId, row.rev, next, now);
  return ok("completeTutorial", {
    userId,
    player,
    serverNow: now,
    changed: true,
  });
}

async function hide(_event, now) {
  const { openid } = contextId();
  if (!openid) return fail("UNAUTHENTICATED", "missing openid");
  const existing = await identity.findUser(db, openid);
  if (!existing) return ok("hide", { serverNow: now });
  const row = await persist.getPlayer(db, existing._id);
  if (!row) return ok("hide", { userId: existing._id, serverNow: now });
  await persist.touchHidden(db, existing._id, now);
  return ok("hide", {
    userId: existing._id,
    serverNow: now,
  });
}

async function readCard(event, now) {
  const { userId, row } = await requirePlayer(now);
  const cardId = event && event.cardId;
  const status = await cards.markRead(db, userId, cardId);
  if (status === "missing") return fail("NOT_FOUND", "card not found");
  try {
    const saved = await persistTick(
      userId,
      row,
      now,
      { enteringApp: false },
      (state) => (status === "updated" ? game.adjustUnread(state, -1) : state)
    );
    return ok("readCard", {
      userId,
      player: saved.player,
      serverNow: now,
      completed: saved.ticked.completed,
      changed: true,
    });
  } catch (err) {
    if (status === "updated") {
      const id = String(cardId || "");
      await db.collection("cards").doc(id).update({ data: { unread: true } });
    }
    throw err;
  }
}

async function listCards(event, now) {
  const { userId, row } = await requirePlayer(now);
  const listed = await cards.listCards(
    db,
    userId,
    event && event.limit,
    event && event.cursor
  );
  const breed = row && row.breed;
  return ok("listCards", {
    userId,
    cards: (listed.cards || []).map((card) => game.presentCard(card, breed)),
    nextCursor: listed.nextCursor,
    serverNow: now,
  });
}

exports.main = async (event) => {
  const now = Date.now();
  const action = event && event.action;
  try {
    if (action === "ensureDb") return await ensureDb();
    if (action === "login") return await login(event, now);
    if (action === "sync") return await sync(event, now);
    if (action === "feed") return await feed(event, now);
    if (action === "welcomeHome") return await welcomeHome(event, now);
    if (action === "clearUnread") return await clearUnread(event, now);
    if (action === "updateProfile") return await updateProfile(event, now);
    if (action === "completeTutorial") return await completeTutorial(event, now);
    if (action === "harvestPlanter") return await harvestPlanter(event, now);
    if (action === "hide") return await hide(event, now);
    if (action === "listCards") return await listCards(event, now);
    if (action === "readCard") return await readCard(event, now);
    return fail("UNKNOWN_ACTION", "unknown action");
  } catch (err) {
    const code = (err && err.code) || "INTERNAL";
    if (code === "REV_CONFLICT") {
      return fail("REV_CONFLICT", "rev conflict");
    }
    if (code === "UNAUTHENTICATED" || code === "NOT_FOUND") {
      return fail(code, err.message);
    }
    console.error(action, err);
    return fail("INTERNAL", (err && err.message) || "internal error");
  }
};
