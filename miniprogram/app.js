const audio = require("./utils/audio.js");
const store = require("./utils/store.js");
const cloudConfig = require("./config/cloud.js");

App({
  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        env: cloudConfig.env,
        traceUser: true,
      });
    }
    this.freshUser = false;
    this.ready = store.login().then((result) => {
      this.freshUser = !!(result && result.isNew);
      return result;
    });
  },

  takeFreshUser() {
    const fresh = !!this.freshUser;
    this.freshUser = false;
    return fresh;
  },

  onShow() {
    audio.playBgm();
    audio.resumeSleep();
    this.pendingEnter = store.hasPriorSession();
  },

  onHide() {
    store.hide();
    audio.pauseBgm();
    audio.pauseSleep();
  },

  peekEnteringApp() {
    return !!this.pendingEnter;
  },

  takeEnteringApp() {
    const entering = !!this.pendingEnter;
    this.pendingEnter = false;
    return entering;
  },

  takeResume() {
    return this.takeEnteringApp();
  },
});
