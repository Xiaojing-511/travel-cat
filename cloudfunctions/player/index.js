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
  if (ticked.newCards && ticked.newCards.length) {
    await cards.insertCards(db, userId, ticked.newCards, now);
  }
  const player = await persist.savePlayer(db, userId, row.rev, state, now);
  return {
    ticked,
    state,
    player,
  };
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
    const saved = await persistTick(user.userId, existing, now, {
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
      hasUnreadCard: seed.hasUnreadCard,
      lastCardTemplateId:
        (seed.collectedCards[0] && seed.collectedCards[0].templateId) || "",
      cardCount: seed.collectedCards.length,
    };
    if (state.food > 0 || state.water > 0) {
      state = { ...state, emptySince: 0 };
    }
    if (seed.collectedCards.length) {
      await cards.insertCards(db, user.userId, seed.collectedCards, now);
    }
  }
  const player = await persist.createPlayer(db, user.userId, state, now);
  return ok("login", {
    userId: user.userId,
    player,
    serverNow: now,
    isNew: true,
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
  const fed = game.feed(ticked.state, now);
  const changed = fed !== ticked.state || ticked.changed || ticked.newCards.length;
  if (!changed) {
    return fail("CANNOT_FEED", "cannot feed", {
      userId,
      player: persist.shapePlayer(row),
      serverNow: now,
    });
  }
  if (ticked.newCards.length) {
    await cards.insertCards(db, userId, ticked.newCards, now);
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

async function listCards(event, now) {
  const { userId } = await requirePlayer(now);
  const listed = await cards.listCards(
    db,
    userId,
    event && event.limit,
    event && event.cursor
  );
  return ok("listCards", {
    userId,
    cards: listed.cards,
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
    if (action === "hide") return await hide(event, now);
    if (action === "listCards") return await listCards(event, now);
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
