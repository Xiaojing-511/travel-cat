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
    this.ready = store.login();
  },

  onShow() {
    audio.playBgm();
    this.pendingEnter = store.hasPriorSession();
  },

  onHide() {
    store.hide();
    audio.pauseBgm();
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
