const cloudConfig = require("../config/cloud.js");

let bgm = null;
let click = null;
let bgmWanted = false;

function playSafe(ctx) {
  if (!ctx || !ctx.src) return;
  try {
    ctx.play();
  } catch (e) {
    console.warn("play audio failed", e);
  }
}

function setBgmSrc(src) {
  if (!bgm || !src) return;
  bgm.src = src;
  if (bgmWanted) playSafe(bgm);
}

function loadCloudBgm() {
  const fileID = cloudConfig.bgmFileID;
  if (!fileID || !wx.cloud) {
    setBgmSrc("/audio/bgm.mp3");
    return;
  }
  wx.cloud.getTempFileURL({
    fileList: [fileID],
    success(res) {
      const item = res.fileList && res.fileList[0];
      setBgmSrc((item && item.tempFileURL) || "/audio/bgm.mp3");
    },
    fail() {
      setBgmSrc("/audio/bgm.mp3");
    },
  });
}

function ensureBgm() {
  if (bgm) return bgm;
  bgm = wx.createInnerAudioContext();
  bgm.loop = true;
  bgm.volume = 0.4;
  bgm.obeyMuteSwitch = true;
  bgm.onError((err) => {
    console.warn("bgm error", err);
  });
  loadCloudBgm();
  return bgm;
}

function ensureClick() {
  if (click) return click;
  click = wx.createInnerAudioContext();
  click.src = "/audio/click.mp3";
  click.volume = 0.75;
  click.obeyMuteSwitch = true;
  click.onError((err) => {
    console.warn("click error", err);
  });
  return click;
}

function playBgm() {
  bgmWanted = true;
  playSafe(ensureBgm());
}

function pauseBgm() {
  bgmWanted = false;
  if (!bgm) return;
  try {
    bgm.pause();
  } catch (e) {
    console.warn("pause bgm failed", e);
  }
}

function playClick() {
  // 部分机型需用户手势后才能播 BGM，点击时顺带拉起
  if (bgmWanted) playSafe(ensureBgm());
  try {
    const a = ensureClick();
    a.stop();
    a.play();
  } catch (e) {
    console.warn("play click failed", e);
  }
}

module.exports = {
  playBgm,
  pauseBgm,
  playClick,
};
