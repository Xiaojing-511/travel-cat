const game = require("../../utils/game.js");
const store = require("../../utils/store.js");
const clock = require("../../utils/clock.js");
const audio = require("../../utils/audio.js");

const DEBUG_HOLD_MS = 6 * 60 * 60 * 1000;
const DEBUG_POSES = [
  { id: "sleep", label: "睡觉", activity: "sleep" },
  { id: "idle", label: "发呆", activity: "idle", idleArt: 0 },
  { id: "wait", label: "等你", activity: "wait" },
  { id: "decide", label: "犹豫出门", activity: "decide", poseVariant: 0 },
  { id: "hungry", label: "等饭", activity: "hungry", food: 0, water: 0, hungry: true },
  { id: "eat", label: "吃饭", activity: "eat" },
  { id: "drink", label: "喝水", activity: "drink" },
  { id: "travel", label: "出门", traveling: true },
  { id: "welcome", label: "你回来啦", activity: "wait", poseVariant: 0, welcome: true },
];

function isDebugBuild() {
  try {
    const info = wx.getAccountInfoSync();
    const version = info && info.miniProgram && info.miniProgram.envVersion;
    return version === "develop" || version === "trial";
  } catch (e) {
    return false;
  }
}

function planterIdOf(raw) {
  const match = String(raw || "").match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function findDebugPose(id) {
  for (let i = 0; i < DEBUG_POSES.length; i++) {
    if (DEBUG_POSES[i].id === id) return DEBUG_POSES[i];
  }
  return null;
}

const SCENE_FADE_MS = 400;
const HARVEST_POP_MS = 2000;
const POP_LEAVES = [
  { id: 0, dx: -72, lift: 0 },
  { id: 1, dx: -48, lift: 20 },
  { id: 2, dx: -24, lift: 6 },
  { id: 3, dx: 0, lift: 28 },
  { id: 4, dx: 24, lift: 8 },
  { id: 5, dx: 48, lift: 22 },
  { id: 6, dx: 72, lift: 4 },
  { id: 7, dx: -36, lift: 40 },
  { id: 8, dx: 12, lift: 44 },
  { id: 9, dx: 36, lift: 34 },
];

const GUIDE_STEPS = [
  {
    selector: ".guide-cat",
    lines: ["这是小咪，", "它会自己生活，也会自己决定什么时候去旅行。"],
  },
  {
    selector: ".guide-album",
    lines: ["这是小咪手记，它带回来的记忆都存在这里哦"],
  },
  {
    selector: ".guide-feed",
    lines: ["在这里可以给小咪添粮添水，及时补充可以帮助小咪顺利出门哦～"],
  },
  {
    selector: ".guide-feed",
    lines: ["现在试着填一些猫粮和水吧～"],
  },
];

Page({
  data: {
    menuTop: 48,
    menuHeight: 32,
    menuRightPad: 96,
    navBarHeight: 88,
    food: 0,
    water: 0,
    traveling: false,
    canFeed: true,
    statusText: "等饭中",
    showStatusBar: false,
    catSrc: "",
    sleeping: false,
    sleepFrames: [],
    eating: false,
    meal: "",
    eatFrames: [],
    idling: false,
    idleFrames: [],
    catPoseKey: [],
    catPlace: "cat-near",
    showBag: false,
    foodBowlSrc: "/images/food/0.png",
    waterBowlSrc: "/images/water/0.png",
    hasUnreadCard: false,
    remainText: "",
    awayText: "",
    travelOutText: "",
    statusRemainText: "",
    showWelcome: false,
    showFeedHint: false,
    showLeafShort: false,
    leafShortText: "",
    leafShortSub: "",
    showIdentity: false,
    nicknameDraft: game.DEFAULT_NICKNAME,
    breedNames: game.BREEDS.map((item) => item.name),
    breedStands: game.BREEDS.map((item) => game.spriteSrc(item.id, "stand")),
    breedIndex: 0,
    breedOpen: false,
    breedLocked: false,
    nicknameSaving: false,
    breedSaving: false,
    userId: "",
    bgmOn: audio.isBgmOn(),
    showGuide: false,
    skipTop: 48,
    guideReady: false,
    guideLines: [],
    guideHoleStyle: "",
    guideTipStyle: "",
    scene: "living",
    sceneDark: false,
    sceneBusy: false,
    leafCount: 0,
    showLeaves: false,
    planters: [
      { id: 1, leaves: 0, hint: false, stage: 0, src: "/images/balcony/planter/00.png" },
      { id: 2, leaves: 0, hint: false, stage: 0, src: "/images/balcony/planter/00.png" },
      { id: 3, leaves: 0, hint: false, stage: 0, src: "/images/balcony/planter/00.png" },
    ],
    bursts: [],
    popLeaves: POP_LEAVES,
    showDebug: false,
    debugOpen: false,
    debugPoseId: "",
    debugPoses: DEBUG_POSES,
    debugBreeds: game.BREEDS.map((item) => ({ id: item.id, name: item.name })),
    shownBreed: game.BREEDS[0].id,
    seeking: true,
  },

  onLoad() {
    try {
      wx.showShareMenu({
        menus: ["shareAppMessage", "shareTimeline"],
      });
    } catch (e) {}
    // getSystemInfoSync 在开发者工具开启 API Hook 时会卡住模拟器逻辑线程。
    let windowWidth = 375;
    let windowHeight = 667;
    let statusBarHeight = 20;
    try {
      const sys = wx.getWindowInfo();
      if (sys && sys.windowWidth) windowWidth = sys.windowWidth;
      if (sys && sys.windowHeight) windowHeight = sys.windowHeight;
      if (sys && sys.statusBarHeight) statusBarHeight = sys.statusBarHeight;
    } catch (e) {}
    this.windowWidth = windowWidth;
    this.windowHeight = windowHeight;
    let menu = {};
    try {
      menu = wx.getMenuButtonBoundingClientRect() || {};
    } catch (e) {}
    const capsuleTop = menu.top || statusBarHeight || 20;
    const capsuleHeight = menu.height || 32;
    const navBarHeight = menu.top
      ? (menu.top - statusBarHeight) * 2 + capsuleHeight + statusBarHeight
      : statusBarHeight + 44;
    this.setData({
      menuTop: menu.top ? menu.top + 40 : statusBarHeight || 20,
      skipTop: capsuleTop,
      menuHeight: capsuleHeight,
      menuRightPad: menu.left ? windowWidth - menu.left + 8 : 96,
      navBarHeight,
      showDebug: isDebugBuild(),
    });
    try {
      wx.setNavigationBarColor({
        frontColor: "#000000",
        backgroundColor: "#ddcebf",
      });
    } catch (e) {}
  },

  onShareAppMessage() {
    return {
      title: "一只猫的旅行",
      path: "/pages/index/index",
    };
  },

  onShareTimeline() {
    return {
      title: "一只猫的旅行",
    };
  },

  onShow() {
    this.hydrate();
  },

  onHide() {
    this.stopTimer();
    this.clearSceneTimer();
    this.dismissWelcome();
    this.hideIdentity();
    this.hideLeaves();
    this.clearHarvestMotion();
    this.dismissLeafShort();
  },

  onUnload() {
    this.stopTimer();
    this.clearSceneTimer();
    this.dismissWelcome();
    this.hideIdentity();
    this.hideLeaves();
    this.clearHarvestMotion();
    this.dismissLeafShort();
  },

  switchScene() {
    if (
      this.showingGuide ||
      this.data.sceneBusy ||
      this.data.showIdentity ||
      this.data.showLeaves
    ) {
      return;
    }
    audio.playClick();
    const next = this.data.scene === "living" ? "balcony" : "living";
    this.clearSceneTimer();
    this.setData({ sceneDark: true, sceneBusy: true });
    this.planterRects = null;
    this.sceneTimer = setTimeout(() => {
      this.setData({ scene: next }, () => {
        if (next === "balcony") this.measurePlanters();
      });
      this.sceneTimer = setTimeout(() => {
        this.setData({ sceneDark: false });
        this.sceneTimer = setTimeout(() => {
          this.sceneTimer = null;
          this.setData({ sceneBusy: false });
        }, SCENE_FADE_MS);
      }, 40);
    }, SCENE_FADE_MS);
  },

  clearSceneTimer() {
    if (this.sceneTimer) {
      clearTimeout(this.sceneTimer);
      this.sceneTimer = null;
    }
    if (this.data.sceneDark || this.data.sceneBusy) {
      this.setData({ sceneDark: false, sceneBusy: false });
    }
  },

  paint(state, now, extra) {
    this.state = state;
    const t = now || clock.approxNow();
    const vm = game.viewModel(state, t);
    vm.shownBreed = (state && state.breed) || game.BREEDS[0].id;
    if (!vm.showFeedHint) this.dismissedFeedHint = false;
    if (this.dismissedFeedHint || this.showingGuide) vm.showFeedHint = false;
    vm.showGuide = !!this.showingGuide;
    if (this.showingGuide) {
      vm.guideLines = GUIDE_STEPS[this.guideStep || 0].lines;
      vm.showIdentity = false;
      vm.showWelcome = false;
      vm.showLeaves = false;
    }
    if (extra) Object.assign(vm, extra);
    this.setData(vm, () => {
      if (this.showingGuide && !this.data.seeking) this.measureGuide();
    });
    audio.syncSleep(!!vm.sleeping);
  },

  armGuide() {
    if (this.showingGuide) return;
    this.showingGuide = true;
    this.guideStep = 0;
    this.guidePending = false;
    this.dismissWelcome();
  },

  paintCache() {
    const cache = store.loadCache();
    const now = clock.approxNow();
    if (!this.guideResolved && !this.showingGuide) this.guidePending = true;
    if (cache && cache.player) {
      this.paint(game.normalize(cache.player, now), now);
      return;
    }
    if (!this.state) this.paint(game.createState(now), now);
  },

  async hydrate() {
    const ticket = (this.hydrateTicket || 0) + 1;
    this.hydrateTicket = ticket;
    const current = () => this.hydrateTicket === ticket;

    if (this.debugLock && this.state) {
      const extra = this.data.seeking ? { seeking: false } : null;
      this.paint(this.state, clock.approxNow(), extra);
      this.seekSettled = true;
      this.startTimer();
      return;
    }

    const app = getApp();
    const enteringPreview = !!(
      app &&
      typeof app.peekEnteringApp === "function" &&
      app.peekEnteringApp()
    );
    // 冷启动，以及从后台重新进入时，先盖住画面，等存档回来再一次画上。
    const seek = !this.seekSettled || enteringPreview;
    if (seek) {
      if (!this.data.seeking) this.setData({ seeking: true });
    } else {
      this.paintCache();
    }

    let freshUser = false;
    try {
      if (app && app.ready) {
        try {
          await app.ready;
        } catch (e) {}
      }
      if (!current()) return;

      this.guideResolved = true;
      if (app && typeof app.takeFreshUser === "function") {
        freshUser = app.takeFreshUser();
      }
      if (freshUser) this.armGuide();
      else this.guidePending = false;
      if (!seek) this.paintCache();

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
      if (!current()) return;

      const now = result.serverNow || clock.approxNow();
      const reveal = seek ? { seeking: false } : null;
      if (this.debugLock && this.state) {
        this.paint(this.state, now, reveal);
        if (seek) this.seekSettled = true;
        this.startTimer();
        return;
      }
      if (result.player) {
        const state = game.normalize(result.player, now);
        if (!freshUser && state.tutorialDone === false && !this.showingGuide) {
          const released = await store.completeTutorial();
          if (!current()) return;
          if (released && released.player) {
            const releasedNow = released.serverNow || now;
            this.paint(game.normalize(released.player, releasedNow), releasedNow, reveal);
          } else {
            this.paint(state, now, reveal);
          }
        } else {
          this.paint(state, now, reveal);
        }
      } else if (this.showingGuide && this.state) {
        this.paint(this.state, now, reveal);
      } else if (reveal) {
        const cache = store.loadCache();
        const fallback =
          cache && cache.player
            ? game.normalize(cache.player, now)
            : this.state || game.createState(now);
        this.paint(fallback, now, reveal);
      }
      if (seek) this.seekSettled = true;
      this.refreshUserId(result && result.userId);
      if (result.offline) {
        wx.showToast({ title: "网络不可用", icon: "none" });
      }
      if (result.completed) {
        wx.showToast({ title: "它回来了", icon: "none" });
      }
      if (result.welcomeBack && !this.showingGuide) {
        this.setData({ showWelcome: true });
        this.welcomeTimer = setTimeout(() => {
          this.finishWelcome();
        }, game.WELCOME_HOLD_MS);
      }
      this.startTimer();
    } catch (e) {
      if (!current() || !seek) return;
      const now = clock.approxNow();
      const cache = store.loadCache();
      const fallback =
        cache && cache.player
          ? game.normalize(cache.player, now)
          : this.state || game.createState(now);
      this.paint(fallback, now, { seeking: false });
      this.seekSettled = true;
      this.startTimer();
    }
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
    if (this.debugLock || this.syncing) return;
    const epoch = this.leafEpoch || 0;
    this.syncing = true;
    try {
      const result = await store.sync({ enteringApp: false });
      if ((this.leafEpoch || 0) !== epoch) return;
      if (result.player) {
        const now = result.serverNow || clock.approxNow();
        const state = game.normalize(result.player, now);
        if (this.data.showIdentity && !this.showingGuide) this.state = state;
        else this.paint(state, now);
      }
      this.refreshUserId(result && result.userId);
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
      if (!this.state || this.data.seeking) return;
      const now = clock.approxNow();
      if (this.showingGuide) {
        if (game.usesLoopFrames(this.state)) {
          this.setData({ catSrc: game.getCatSrc(this.state, now) });
        }
        return;
      }
      const dueTravel =
        this.state.status === "traveling" &&
        now >= (Number(this.state.travelEndAt) || 0);
      const dueHome =
        this.state.status === "home" &&
        now >= (Number(this.state.activityEndAt) || 0);
      const dueRelief =
        this.state.reliefMealAt > 0 && now >= this.state.reliefMealAt;
      const duePlant = (this.state.planters || []).some(
        (pot) => pot.nextGrowAt > 0 && now >= pot.nextGrowAt
      );
      if ((dueTravel || dueHome || dueRelief || duePlant) && !this.syncing) {
        this.pullSync();
        return;
      }
      if (this.data.showIdentity) return;
      const eating =
        this.state.activity === "eat" || this.state.activity === "drink";
      const mealVm = eating ? game.viewModel(this.state, now) : null;
      const emptyTooLong = mealVm
        ? mealVm.showFeedHint
        : game.emptyTooLong(this.state, now);
      if (!emptyTooLong) this.dismissedFeedHint = false;
      const patch = {
        statusRemainText: game.formatRemain(game.statusRemainMs(this.state, now)),
        showFeedHint: emptyTooLong && !this.dismissedFeedHint,
      };
      if (mealVm) {
        if (mealVm.food !== this.data.food) patch.food = mealVm.food;
        if (mealVm.water !== this.data.water) patch.water = mealVm.water;
        if (mealVm.foodBowlSrc !== this.data.foodBowlSrc) {
          patch.foodBowlSrc = mealVm.foodBowlSrc;
        }
        if (mealVm.waterBowlSrc !== this.data.waterBowlSrc) {
          patch.waterBowlSrc = mealVm.waterBowlSrc;
        }
        if (mealVm.canFeed !== this.data.canFeed) patch.canFeed = mealVm.canFeed;
      }
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

  toggleBgm() {
    if (this.showingGuide) return;
    audio.playClick();
    this.setData({ bgmOn: audio.toggleBgm() });
  },

  onHelp() {
    if (this.guideFinishing) return;
    audio.playClick();
    this.guidePending = false;
    this.showingGuide = true;
    this.guideStep = 0;
    this.dismissWelcome();
    this.setData({ guideReady: false, guideLines: GUIDE_STEPS[0].lines });
    const now = clock.approxNow();
    if (this.state) this.paint(this.state, now);
    else {
      this.setData(
        {
          showGuide: true,
          guideReady: false,
          guideLines: GUIDE_STEPS[0].lines,
          showIdentity: false,
          showWelcome: false,
          showLeaves: false,
        },
        () => this.measureGuide()
      );
    }
  },

  measureGuide(attempt) {
    if (!this.showingGuide) return;
    const step = GUIDE_STEPS[this.guideStep || 0];
    const token = (this.guideMeasureToken || 0) + 1;
    this.guideMeasureToken = token;
    const run = () => {
      if (!this.showingGuide || token !== this.guideMeasureToken) return;
      const query = wx.createSelectorQuery().in(this);
      query.selectAll(step.selector).boundingClientRect();
      query.exec((res) => {
        if (!this.showingGuide || token !== this.guideMeasureToken) return;
        const rect = this.pickGuideRect(res && res[0]);
        if (!rect) {
          if ((attempt || 0) < 12) {
            setTimeout(() => {
              if (token === this.guideMeasureToken) {
                this.measureGuide((attempt || 0) + 1);
              }
            }, 80);
            return;
          }
          this.placeGuide(this.fallbackGuideRect());
          return;
        }
        this.placeGuide(rect);
      });
    };
    if (typeof wx.nextTick === "function") wx.nextTick(run);
    else run();
  },

  pickGuideRect(list) {
    const rects = Array.isArray(list) ? list : list ? [list] : [];
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      if (rect && rect.width > 0 && rect.height > 0) return rect;
    }
    return null;
  },

  fallbackGuideRect() {
    const winW = this.windowWidth || 375;
    const winH = this.windowHeight || 667;
    const rpx = winW / 750;
    if (this.data.traveling) {
      const width = Math.min(winW - 80, 280);
      const height = 72;
      return {
        left: (winW - width) / 2,
        top: winH * 0.38,
        width: width,
        height: height,
      };
    }
    if (this.data.catPlace === "cat-door") {
      const width = 168 * rpx;
      const height = 200 * rpx;
      return {
        left: winW * 0.7 - width / 2,
        top: winH * 0.8 - height,
        width: width,
        height: height,
      };
    }
    let width = 360 * rpx;
    let height = 300 * rpx;
    let bottom = 90 * rpx;
    let left = 90 * rpx;
    if (this.data.sleeping) height = 197 * rpx;
    if (this.data.eating) {
      width = 240 * rpx;
      height = 237 * rpx;
      bottom = 312 * rpx;
      left = (this.data.meal === "drink" ? 172 : 242) * rpx;
    }
    return {
      left: left,
      top: winH - bottom - height,
      width: width,
      height: height,
    };
  },

  placeGuide(rect) {
    const pad = 10;
    const winW = this.windowWidth || 375;
    const winH = this.windowHeight || 667;
    let left = rect.left - pad;
    let top = rect.top - pad;
    let width = rect.width + pad * 2;
    let height = rect.height + pad * 2;
    if (left < 4) {
      width -= 4 - left;
      left = 4;
    }
    if (top < 4) {
      height -= 4 - top;
      top = 4;
    }
    if (left + width > winW - 4) width = Math.max(8, winW - 4 - left);
    if (top + height > winH - 4) height = Math.max(8, winH - 4 - top);
    const hole =
      "left:" +
      left +
      "px;top:" +
      top +
      "px;width:" +
      width +
      "px;height:" +
      height +
      "px;";
    const tipMax = Math.min(280, winW - 32);
    let tip;
    if (rect.top > winH * 0.45) {
      const tipLeft = Math.max(16, Math.min(left, winW - tipMax - 16));
      tip =
        "left:" +
        tipLeft +
        "px;width:" +
        tipMax +
        "px;bottom:" +
        (winH - top + 14) +
        "px;";
    } else {
      tip =
        "top:" +
        (top + height + 14) +
        "px;right:16px;width:" +
        tipMax +
        "px;";
    }
    this.setData({
      guideHoleStyle: hole,
      guideTipStyle: tip,
      guideReady: true,
      guideLines: (GUIDE_STEPS[this.guideStep || 0] || GUIDE_STEPS[0]).lines,
    });
  },

  onGuideNext() {
    if (!this.showingGuide || this.guideFinishing || !this.data.guideReady) return;
    audio.playClick();
    const next = (this.guideStep || 0) + 1;
    if (next >= GUIDE_STEPS.length) {
      this.finishGuide();
      return;
    }
    this.guideStep = next;
    this.measureGuide();
  },

  onGuideSkip() {
    if (!this.showingGuide || this.guideFinishing) return;
    audio.playClick();
    this.finishGuide();
  },

  async finishGuide() {
    if (this.guideFinishing) return;
    this.guideFinishing = true;
    try {
      const app = getApp();
      if (app && app.ready) {
        try {
          await app.ready;
        } catch (e) {}
      }
      const result = await store.completeTutorial();
      if (!result || !result.ok || !result.player) {
        const offline =
          !result ||
          result.offline ||
          result.code === "NETWORK" ||
          result.code === "NOT_FOUND";
        const title =
          result && result.code === "UNKNOWN_ACTION"
            ? "请更新云函数"
            : offline
              ? "网络不可用"
              : "保存失败";
        wx.showToast({ title: title, icon: "none" });
        return;
      }
      this.showingGuide = false;
      this.guidePending = false;
      this.guideStep = 0;
      const now = result.serverNow || clock.approxNow();
      this.paint(game.normalize(result.player, now), now);
    } finally {
      this.guideFinishing = false;
    }
  },

  holdDebugState(state, now) {
    const end = now + DEBUG_HOLD_MS;
    const traveling = state.status === "traveling";
    return {
      ...state,
      activityEndAt: end,
      travelEndAt: traveling ? end : 0,
      nextDrinkCheckAt: end,
      nextEatCheckAt: end,
      nextIdleArtAt: state.activity === "idle" ? end : state.nextIdleArtAt,
      reliefMealAt: 0,
      welcomeHoldUntil: 0,
    };
  },

  toggleDebug() {
    if (!this.data.showDebug || this.showingGuide) return;
    this.setData({ debugOpen: !this.data.debugOpen });
  },

  applyDebugPose(e) {
    const pose = findDebugPose(e.currentTarget.dataset.id);
    if (!pose || !this.state) return;
    const now = clock.approxNow();
    const food = pose.food == null ? 30 : pose.food;
    const water = pose.water == null ? 30 : pose.water;
    let next = {
      ...this.state,
      food,
      water,
      emptySince: pose.hungry ? now - game.EMPTY_HUNGRY_MS - 1000 : 0,
      reliefMealAt: 0,
      welcomeHoldUntil: 0,
      status: "home",
      travelEndAt: 0,
    };
    if (pose.traveling) {
      next = {
        ...next,
        status: "traveling",
        travelStartedAt: now - 37 * 60 * 1000,
        travelEndAt: now + DEBUG_HOLD_MS,
        activityEndAt: now + DEBUG_HOLD_MS,
        nextDrinkCheckAt: now + DEBUG_HOLD_MS,
        nextEatCheckAt: now + DEBUG_HOLD_MS,
      };
    } else {
      next = game.applyActivity(next, pose.activity, now, DEBUG_HOLD_MS);
      if (pose.idleArt != null) {
        next.idleArt = pose.idleArt;
        next.nextIdleArtAt = now + DEBUG_HOLD_MS;
      }
      if (pose.poseVariant != null) next.poseVariant = pose.poseVariant;
      next.nextDrinkCheckAt = now + DEBUG_HOLD_MS;
      next.nextEatCheckAt = now + DEBUG_HOLD_MS;
      next.reliefMealAt = 0;
    }
    this.debugLock = true;
    this.dismissedFeedHint = false;
    this.dismissWelcome();
    this.paint(next, now);
    this.setData({
      debugPoseId: pose.id,
      showWelcome: !!pose.welcome,
    });
  },

  applyDebugBreed(e) {
    if (!this.state) return;
    const id = game.sanitizeBreed(e.currentTarget.dataset.id);
    if (!id) return;
    const current = this.state.breed || game.BREEDS[0].id;
    if (id === current) return;
    if (this.archiveBreed == null) this.archiveBreed = this.state.breed || "";
    const now = clock.approxNow();
    const next = this.holdDebugState({ ...this.state, breed: id }, now);
    this.debugLock = true;
    this.dismissWelcome();
    this.paint(next, now);
  },

  applyDebugBowls(e) {
    if (!this.state) return;
    const grams = Number(e.currentTarget.dataset.grams);
    const now = clock.approxNow();
    const next = this.holdDebugState(
      {
        ...this.state,
        food: grams,
        water: grams,
        emptySince: grams <= 0 ? now - game.EMPTY_HUNGRY_MS - 1000 : 0,
      },
      now
    );
    this.debugLock = true;
    this.dismissedFeedHint = false;
    this.paint(next, now);
    this.setData({ debugPoseId: "bowls-" + grams });
  },

  clearDebugPose() {
    this.debugLock = false;
    this.archiveBreed = null;
    this.dismissWelcome();
    this.setData({ debugPoseId: "" });
    this.hydrate();
  },

  presentLeafNotice(text, sub) {
    if (this.leafShortTimer) clearTimeout(this.leafShortTimer);
    this.setData({
      showLeafShort: true,
      leafShortText: text,
      leafShortSub: sub || "",
    });
    this.leafShortTimer = setTimeout(() => {
      this.leafShortTimer = null;
      this.dismissLeafShort();
    }, 3200);
  },

  presentLeafShort() {
    this.presentLeafNotice("不足，无法喂食哦", "尝试去阳台摘取一些吧");
  },

  presentGrowTip() {
    audio.playClick();
    this.presentLeafNotice("正在生长，一会再来看看吧～", "");
  },

  dismissLeafShort() {
    if (this.leafShortTimer) {
      clearTimeout(this.leafShortTimer);
      this.leafShortTimer = null;
    }
    if (this.data.showLeafShort) this.setData({ showLeafShort: false });
  },

  async onFeed() {
    if (this.showingGuide || this.guidePending) return;
    if (this.debugLock) {
      wx.showToast({ title: "调试中，先点恢复存档", icon: "none" });
      return;
    }
    audio.playClick();
    if (!this.state) return;
    if (this.data.showWelcome) this.dismissWelcome();
    if (this.data.showFeedHint) {
      this.dismissedFeedHint = true;
      this.setData({ showFeedHint: false });
    }
    if (
      game.canFeed(this.state) &&
      game.feedBlockedByLeaves(this.state, clock.approxNow())
    ) {
      this.presentLeafShort();
      return;
    }
    const result = await store.feed();
    if (result.code === "NEED_LEAVES") {
      this.presentLeafShort();
      if (result.player) {
        const now = result.serverNow || clock.approxNow();
        this.paint(game.normalize(result.player, now), now);
      }
      return;
    }
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
    if (this.showingGuide || this.guidePending) return;
    audio.playClick();
    wx.navigateTo({ url: "/pages/cards/index" });
  },

  onService() {
    audio.playClick();
  },

  burstView() {
    const pops = this.popIds || {};
    return Object.keys(pops)
      .filter((key) => pops[key])
      .map((key) => ({ id: Number(key) }))
      .sort((a, b) => a.id - b.id);
  },

  clearHarvestMotion() {
    this.leafEpoch = (this.leafEpoch || 0) + 1;
    this.harvestLocks = {};
    this.harvestTokens = {};
    this.popIds = {};
    this.planterRects = null;
    const timers = this.popTimers || {};
    Object.keys(timers).forEach((key) => clearTimeout(timers[key]));
    this.popTimers = {};
    if (this.data.bursts && this.data.bursts.length) {
      this.setData({ bursts: [] });
    }
  },

  measurePlanters(points, notifyGrowing) {
    const query = wx.createSelectorQuery().in(this);
    query.selectAll(".planter").boundingClientRect();
    query.exec((res) => {
      this.planterRects = (res && res[0]) || [];
      if (points) this.harvestAtPoints(points, notifyGrowing);
    });
  },

  onBalconyTouch(e) {
    if (this.data.scene !== "balcony") return;
    if (
      this.showingGuide ||
      this.guidePending ||
      this.data.showLeaves ||
      this.data.showIdentity ||
      this.data.sceneBusy
    ) {
      return;
    }
    const touches = (e.touches && e.touches.length && e.touches) || [];
    if (!touches.length) return;
    const points = [];
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      points.push({
        x: touch.clientX != null ? touch.clientX : touch.pageX,
        y: touch.clientY != null ? touch.clientY : touch.pageY,
      });
    }
    const tapping = e.type === "touchstart";
    if (tapping || !this.planterRects || !this.planterRects.length) {
      this.measurePlanters(points, tapping);
      return;
    }
    this.harvestAtPoints(points, false);
  },

  harvestAtPoints(points, notifyGrowing) {
    const rects = this.planterRects || [];
    const chosen = {};
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      let bestId = 0;
      for (let j = 0; j < rects.length; j++) {
        const rect = rects[j];
        if (!rect || rect.width <= 0 || rect.height <= 0) continue;
        if (
          point.x < rect.left ||
          point.x > rect.right ||
          point.y < rect.top ||
          point.y > rect.bottom
        ) {
          continue;
        }
        const id = Number(rect.dataset && rect.dataset.id) || planterIdOf(rect.id);
        if (!id) continue;
        if (!bestId || id < bestId) bestId = id;
      }
      if (bestId) chosen[bestId] = true;
    }
    this.growTipped = false;
    Object.keys(chosen).forEach((id) => {
      this.harvestPlanter(Number(id), notifyGrowing && !this.growTipped);
    });
  },

  async harvestPlanter(id, notifyGrowing) {
    id = Number(id);
    if (!id || (this.harvestLocks && this.harvestLocks[id])) return;
    if (this.debugLock) {
      if (!this.debugHarvestNoted) {
        this.debugHarvestNoted = true;
        wx.showToast({ title: "调试中，先点恢复存档", icon: "none" });
        setTimeout(() => {
          this.debugHarvestNoted = false;
        }, 1500);
      }
      return;
    }
    const before = this.state;
    if (!before) return;
    const pot = (before.planters || []).find((item) => item.id === id);
    if (!pot || pot.leaves < game.LEAF_BATCH) {
      if (notifyGrowing && pot) {
        this.growTipped = true;
        this.presentGrowTip();
      }
      return;
    }
    if (!this.harvestLocks) this.harvestLocks = {};
    if (!this.harvestTokens) this.harvestTokens = {};
    if (!this.popIds) this.popIds = {};
    if (!this.popTimers) this.popTimers = {};
    const token = {};
    this.harvestLocks[id] = true;
    this.harvestTokens[id] = token;
    this.popIds[id] = true;
    this.leafEpoch = (this.leafEpoch || 0) + 1;
    const started = Date.now();
    const nowSeen = clock.approxNow();
    audio.playClick();
    const optimistic = game.harvestPlanter(before, id, nowSeen, pot.leaves);
    if (!optimistic) {
      delete this.harvestLocks[id];
      delete this.harvestTokens[id];
      delete this.popIds[id];
      return;
    }
    this.paint(optimistic, nowSeen, { bursts: this.burstView() });
    let result;
    try {
      result = await store.harvestPlanter(id, pot.leaves);
    } catch (e) {
      result = { ok: false, offline: true };
    }
    if (this.harvestTokens[id] !== token) return;
    const failed = !result || !result.ok;
    if (failed) {
      if (!result || result.code !== "CANNOT_HARVEST") {
        wx.showToast({
          title: result && result.offline ? "网络不可用" : "采收失败",
          icon: "none",
        });
      }
      delete this.popIds[id];
      delete this.harvestLocks[id];
      delete this.harvestTokens[id];
      const bursts = this.burstView();
      if (result && result.player) {
        const now = result.serverNow || clock.approxNow();
        this.paint(game.normalize(result.player, now), now, { bursts });
      } else {
        this.paint(before, clock.approxNow(), { bursts });
      }
      return;
    }
    const now = result.serverNow || clock.approxNow();
    this.paint(game.normalize(result.player, now), now);
    const wait = Math.max(0, HARVEST_POP_MS - (Date.now() - started));
    this.popTimers[id] = setTimeout(() => {
      if (!this.harvestTokens || this.harvestTokens[id] !== token) return;
      delete this.popIds[id];
      delete this.harvestLocks[id];
      delete this.harvestTokens[id];
      delete this.popTimers[id];
      this.setData({ bursts: this.burstView() });
    }, wait);
  },

  openLeaves() {
    if (this.showingGuide || this.guidePending || this.data.sceneBusy) return;
    audio.playClick();
    this.setData({ showLeaves: true });
  },

  closeLeaves() {
    if (!this.data.showLeaves) return;
    audio.playClick();
    this.setData({ showLeaves: false });
  },

  hideLeaves() {
    if (!this.data.showLeaves) return;
    this.setData({ showLeaves: false });
  },

  breedIndexOf(id) {
    for (let i = 0; i < game.BREEDS.length; i++) {
      if (game.BREEDS[i].id === id) return i;
    }
    return 0;
  },

  currentUserId(userId) {
    if (userId) return String(userId);
    const cache = store.loadCache();
    return (cache && cache.userId && String(cache.userId)) || "";
  },

  refreshUserId(userId) {
    if (!this.data.showIdentity) return;
    const next = this.currentUserId(userId);
    if (next && next !== this.data.userId) this.setData({ userId: next });
  },

  openIdentity() {
    if (this.showingGuide || this.guidePending) return;
    audio.playClick();
    const state = this.state || {};
    const savedBreed = this.archiveBreed != null ? this.archiveBreed : state.breed;
    const breedId = savedBreed || game.BREEDS[0].id;
    const nickname = state.nickname || game.DEFAULT_NICKNAME;
    this._nicknameDraft = nickname;
    this.setData({
      showIdentity: true,
      nicknameDraft: nickname,
      breedIndex: this.breedIndexOf(breedId),
      breedOpen: false,
      breedLocked: !!(state.breedLocked && savedBreed),
      userId: this.currentUserId(),
    });
  },

  copyUserId() {
    const userId = this.data.userId || this.currentUserId();
    if (!userId) return;
    audio.playClick();
    wx.setClipboardData({
      data: userId,
      success() {
        wx.hideToast();
        wx.showToast({ title: "用户编号复制成功", icon: "none" });
      },
    });
  },

  hideIdentity() {
    if (!this.data.showIdentity) return;
    this.setData({ showIdentity: false });
    if (this.state) this.paint(this.state, clock.approxNow());
  },

  closeIdentity() {
    if (!this.data.showIdentity) return;
    audio.playClick();
    this.hideIdentity();
  },

  stopTap() {
    if (this.data.breedOpen) this.setData({ breedOpen: false });
  },

  onNicknameInput(e) {
    this._nicknameDraft = e.detail.value == null ? "" : String(e.detail.value);
  },

  onNicknameBlur(e) {
    const text = String((e.detail && e.detail.value) || "").trim();
    this._nicknameDraft = text;
    if (text !== this.data.nicknameDraft) this.setData({ nicknameDraft: text });
  },

  nicknameRaw(e) {
    if (e && e.type === "confirm" && e.detail && typeof e.detail.value === "string") {
      return e.detail.value;
    }
    if (this._nicknameDraft != null) return this._nicknameDraft;
    return this.data.nicknameDraft;
  },

  toggleBreed() {
    if (this.data.breedLocked || this.breedConfirming) return;
    audio.playClick();
    this.setData({ breedOpen: !this.data.breedOpen });
  },

  pickBreed(e) {
    if (this.data.breedLocked) return;
    const index = Number(e.currentTarget.dataset.index);
    if (!game.BREEDS[index]) return;
    audio.playClick();
    this.setData({ breedIndex: index, breedOpen: false });
  },

  profileToast(result) {
    if (result && result.offline) return "网络不可用";
    const code = result && result.code;
    if (code === "NICKNAME_INVALID" || code === "EMPTY_PROFILE") return "请填写昵称";
    if (code === "NICKNAME_LONG") return "昵称最多10个字";
    if (code === "BREED_LOCKED") return "品种已选定";
    if (code === "BREED_INVALID") return "请选择品种";
    if (code === "UNKNOWN_ACTION") return "请更新云函数";
    if (code === "UNAUTHENTICATED") return "请重新登录";
    return "保存失败";
  },

  paintProfile(result) {
    if (!result || !result.player) return;
    const now = result.serverNow || clock.approxNow();
    this.paint(game.normalize(result.player, now), now);
  },

  async saveNickname(e) {
    if (this.nicknameLock) return;
    this.nicknameLock = true;
    audio.playClick();
    try {
      const raw = this.nicknameRaw(e);
      const issue = game.nicknameIssue(raw);
      if (issue === "empty") {
        wx.showToast({ title: "请填写昵称", icon: "none" });
        return;
      }
      if (issue === "long") {
        wx.showToast({ title: "昵称最多10个字", icon: "none" });
        return;
      }
      const nickname = game.sanitizeNickname(raw);
      this._nicknameDraft = nickname;
      this.setData({ nicknameDraft: nickname, nicknameSaving: true });
      const result = await store.updateProfile({ nickname });
      if (!result.ok) {
        wx.showToast({ title: this.profileToast(result), icon: "none" });
        this.paintProfile(result);
        return;
      }
      this.paintProfile(result);
      if (this.data.showIdentity) {
        this.setData({
          nicknameDraft: (result.player && result.player.nickname) || nickname,
        });
      }
      wx.showToast({
        title: result.completed ? "它回来了" : "已保存",
        icon: "none",
      });
    } finally {
      this.nicknameLock = false;
      this.setData({ nicknameSaving: false });
    }
  },

  async saveBreed() {
    if (this.data.breedLocked || this.breedConfirming) return;
    this.breedConfirming = true;
    audio.playClick();
    const breed = game.BREEDS[this.data.breedIndex] || game.BREEDS[0];
    this.setData({ breedOpen: false });
    try {
      const confirmed = await new Promise((resolve) => {
        wx.showModal({
          title: "选定品种",
          content:
            "品种只能选择一次，保存后不能修改。确定选择「" + breed.name + "」吗？",
          confirmText: "确定",
          cancelText: "再想想",
          confirmColor: "#6a7a62",
          success(res) {
            resolve(!!(res && res.confirm));
          },
          fail() {
            resolve(false);
          },
        });
      });
      if (!confirmed || this.data.breedLocked) return;
      this.setData({ breedSaving: true });
      const result = await store.updateProfile({ breed: breed.id });
      if (!result.ok) {
        wx.showToast({ title: this.profileToast(result), icon: "none" });
        this.paintProfile(result);
        this.syncBreedForm();
        return;
      }
      this.paintProfile(result);
      this.syncBreedForm();
      wx.showToast({
        title: result.completed ? "它回来了" : "已保存",
        icon: "none",
      });
    } finally {
      this.breedConfirming = false;
      this.setData({ breedSaving: false });
    }
  },

  syncBreedForm() {
    if (!this.data.showIdentity) return;
    const state = this.state || {};
    const locked = !!(state.breedLocked && state.breed);
    this.setData({
      breedLocked: locked,
      breedOpen: false,
      breedIndex: this.breedIndexOf(state.breed || game.BREEDS[0].id),
    });
  },
});
