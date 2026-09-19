const game = require("../../utils/game.js");
const store = require("../../utils/store.js");
const clock = require("../../utils/clock.js");
const audio = require("../../utils/audio.js");

Page({
  data: {
    menuTop: 48,
    menuHeight: 32,
    menuRightPad: 96,
    food: 0,
    water: 0,
    traveling: false,
    canFeed: true,
    statusText: "等饭中",
    catSrc: "",
    sleeping: false,
    sleepFrames: [],
    eating: false,
    eatFrames: [],
    catPlace: "cat-near",
    foodBowlSrc: "",
    waterBowlSrc: "",
    hasUnreadCard: false,
    remainText: "",
    awayText: "",
    statusRemainText: "",
    showWelcome: false,
  },

  onLoad() {
    const sys = wx.getSystemInfoSync();
    const menu = wx.getMenuButtonBoundingClientRect() || {};
    this.setData({
      menuTop: menu.top + 40 || sys.statusBarHeight || 20,
      menuHeight: menu.height || 32,
      menuRightPad: menu.left ? sys.windowWidth - menu.left + 8 : 96,
    });
  },

  onShow() {
    this.hydrate();
  },

  onHide() {
    this.stopTimer();
    this.dismissWelcome();
  },

  onUnload() {
    this.stopTimer();
    this.dismissWelcome();
  },

  paint(state, now) {
    this.state = state;
    this.setData(game.viewModel(state, now || clock.approxNow()));
  },

  paintCache() {
    const cache = store.loadCache();
    const now = clock.approxNow();
    if (cache && cache.player) {
      this.paint(game.normalize(cache.player, now), now);
      return;
    }
    if (!this.state) {
      this.paint(game.createState(now), now);
    }
  },

  async hydrate() {
    const app = getApp();
    this.paintCache();
    if (app && app.ready) {
      try {
        await app.ready;
        this.paintCache();
      } catch (e) {}
    }
    const enteringApp = !!(
      app &&
      typeof app.takeEnteringApp === "function" &&
      app.takeEnteringApp()
    );
    if (this.welcomeTimer) {
      clearTimeout(this.welcomeTimer);
      this.welcomeTimer = null;
    }
    const result = await store.sync({ enteringApp });
    const now = result.serverNow || clock.approxNow();
    if (result.player) {
      this.paint(game.normalize(result.player, now), now);
    }
    if (result.offline) {
      wx.showToast({ title: "网络不可用", icon: "none" });
    }
    if (result.completed) {
      wx.showToast({ title: "它回来了", icon: "none" });
    }
    if (result.welcomeBack) {
      this.setData({ showWelcome: true });
      this.welcomeTimer = setTimeout(() => {
        this.finishWelcome();
      }, game.WELCOME_HOLD_MS);
    }
    this.startTimer();
  },

  dismissWelcome() {
    if (this.welcomeTimer) {
      clearTimeout(this.welcomeTimer);
      this.welcomeTimer = null;
    }
    if (this.data.showWelcome) this.setData({ showWelcome: false });
  },

  async finishWelcome() {
    this.dismissWelcome();
    if (!this.state || this.state.activity !== "wait") return;
    const result = await store.welcomeHome();
    if (result.offline) {
      wx.showToast({ title: "网络不可用", icon: "none" });
      return;
    }
    if (result.player) {
      const now = result.serverNow || clock.approxNow();
      this.paint(game.normalize(result.player, now), now);
    }
  },

  async pullSync() {
    if (this.syncing) return;
    this.syncing = true;
    try {
      const result = await store.sync({ enteringApp: false });
      if (result.player) {
        const now = result.serverNow || clock.approxNow();
        this.paint(game.normalize(result.player, now), now);
      }
      if (result.completed) {
        wx.showToast({ title: "它回来了", icon: "none" });
      }
    } finally {
      this.syncing = false;
    }
  },

  startTimer() {
    this.stopTimer();
    this.timer = setInterval(() => {
      if (!this.state) return;
      const now = clock.approxNow();
      const dueTravel =
        this.state.status === "traveling" &&
        now >= (Number(this.state.travelEndAt) || 0);
      const dueHome =
        this.state.status === "home" &&
        now >= (Number(this.state.activityEndAt) || 0);
      const dueRelief =
        this.state.reliefMealAt > 0 && now >= this.state.reliefMealAt;
      if ((dueTravel || dueHome || dueRelief) && !this.syncing) {
        this.pullSync();
        return;
      }
      const patch = {
        statusRemainText: game.formatRemain(game.statusRemainMs(this.state, now)),
      };
      if (this.state.status === "traveling") {
        patch.remainText = game.formatRemain(game.statusRemainMs(this.state, now));
        patch.awayText = game.formatAway(this.state, now);
      }
      if (game.usesLoopFrames(this.state)) {
        patch.catSrc = game.getCatSrc(this.state, now);
      }
      this.setData(patch);
    }, 1000);
  },

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  async onFeed() {
    audio.playClick();
    if (!this.state) return;
    if (this.data.showWelcome) this.dismissWelcome();
    const result = await store.feed();
    if (result.offline || result.code === "CANNOT_FEED") {
      if (result.offline) {
        wx.showToast({ title: "网络不可用", icon: "none" });
      }
      if (result.player) {
        const now = result.serverNow || clock.approxNow();
        this.paint(game.normalize(result.player, now), now);
      }
      return;
    }
    if (result.player) {
      const now = result.serverNow || clock.approxNow();
      this.paint(game.normalize(result.player, now), now);
    }
  },

  openCards() {
    audio.playClick();
    wx.navigateTo({ url: "/pages/cards/index" });
  },
});
