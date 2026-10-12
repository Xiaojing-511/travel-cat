const cloudConfig = require("../config/cloud.js");

const BGM_KEY = "travel_cat_bgm_on";
const BGM_VOLUME = 0.5;

let audioCtx = null;
let gainNode = null;
let bgmSource = null;
let bgmBuffer = null;
let bgmLoad = null;
let bgmFallback = null;
let click = null;
let sleep = null;
let bgmWanted = false;
let sleepWanted = false;
let bgmOn = readBgmOn();

function readBgmOn() {
  try {
    const value = wx.getStorageSync(BGM_KEY);
    if (value === false || value === 0 || value === "0") return false;
    return true;
  } catch (e) {
    return true;
  }
}

function writeBgmOn(on) {
  try {
    wx.setStorageSync(BGM_KEY, !!on);
  } catch (e) {}
}

function isBgmOn() {
  return bgmOn;
}

function canWebAudio() {
  return typeof wx.createWebAudioContext === "function";
}

function ensureWeb() {
  if (audioCtx) return audioCtx;
  audioCtx = wx.createWebAudioContext();
  gainNode = audioCtx.createGain();
  gainNode.gain.value = BGM_VOLUME;
  gainNode.connect(audioCtx.destination);
  return audioCtx;
}

function applyBgmVolume() {
  if (gainNode) {
    gainNode.gain.value = BGM_VOLUME;
    return;
  }
  if (!bgmFallback) return;
  try {
    bgmFallback.volume = BGM_VOLUME;
  } catch (e) {}
}

function resumeWeb() {
  if (!audioCtx || typeof audioCtx.resume !== "function")
    return Promise.resolve();
  try {
    const pending = audioCtx.resume();
    if (pending && typeof pending.then === "function")
      return pending.catch(function () {});
  } catch (e) {}
  return Promise.resolve();
}

function suspendWeb() {
  if (!audioCtx || typeof audioCtx.suspend !== "function") return;
  try {
    audioCtx.suspend();
  } catch (e) {}
}

function startBgmSource() {
  if (!audioCtx || !bgmBuffer || !gainNode || bgmSource) return;
  applyBgmVolume();
  const source = audioCtx.createBufferSource();
  source.buffer = bgmBuffer;
  source.loop = true;
  source.connect(gainNode);
  try {
    source.start(0);
  } catch (e) {
    return;
  }
  bgmSource = source;
  source.onended = function () {
    if (bgmSource === source) bgmSource = null;
  };
}

function loadBgmBuffer() {
  if (bgmBuffer) return Promise.resolve(bgmBuffer);
  if (bgmLoad) return bgmLoad;
  bgmLoad = new Promise(function (resolve) {
    const finish = function (buffer) {
      bgmBuffer = buffer || null;
      resolve(bgmBuffer);
    };
    if (!cloudConfig.bgmFileID || !wx.cloud) {
      finish(null);
      return;
    }
    wx.cloud.getTempFileURL({
      fileList: [cloudConfig.bgmFileID],
      success(res) {
        const item = res.fileList && res.fileList[0];
        const url = item && item.tempFileURL;
        if (!url) {
          console.warn("bgm temp url missing", item);
          finish(null);
          return;
        }
        wx.request({
          url: url,
          responseType: "arraybuffer",
          success(file) {
            const data = file && file.data;
            if (!data) {
              finish(null);
              return;
            }
            let settled = false;
            const done = function (buffer) {
              if (settled) return;
              settled = true;
              finish(buffer);
            };
            const fail = function (err) {
              if (settled) return;
              settled = true;
              console.warn("bgm decode failed", err);
              finish(null);
            };
            try {
              const ctx = ensureWeb();
              const pending = ctx.decodeAudioData(data, done, fail);
              if (pending && typeof pending.then === "function") {
                pending.then(done).catch(fail);
              }
            } catch (err) {
              fail(err);
            }
          },
          fail(err) {
            console.warn("bgm download failed", err);
            finish(null);
          },
        });
      },
      fail(err) {
        console.warn("bgm cloud url failed", err);
        finish(null);
      },
    });
  });
  return bgmLoad;
}

function playWebBgm() {
  try {
    ensureWeb();
  } catch (e) {
    playSafe(ensureFallbackBgm());
    return Promise.resolve();
  }
  applyBgmVolume();
  return loadBgmBuffer().then(function (buffer) {
    if (!bgmWanted || !bgmOn) return;
    if (!buffer) {
      playSafe(ensureFallbackBgm());
      return;
    }
    return resumeWeb().then(function () {
      if (!bgmWanted || !bgmOn) return;
      applyBgmVolume();
      startBgmSource();
    });
  });
}

function playSafe(ctx) {
  if (!ctx || !ctx.src) return;
  if (ctx === bgmFallback) applyBgmVolume();
  try {
    ctx.play();
  } catch (e) {
    console.warn("play audio failed", e);
  }
}

function pauseSafe(ctx, label) {
  if (!ctx) return;
  try {
    ctx.pause();
  } catch (e) {
    console.warn("pause " + label + " failed", e);
  }
}

function stopSafe(ctx, label) {
  if (!ctx) return;
  try {
    ctx.stop();
  } catch (e) {
    console.warn("stop " + label + " failed", e);
  }
}

function loadCloudUrl(fileID, label, apply) {
  if (!fileID || !wx.cloud) {
    console.warn(label + " cloud unavailable");
    return;
  }
  wx.cloud.getTempFileURL({
    fileList: [fileID],
    success(res) {
      const item = res.fileList && res.fileList[0];
      const url = item && item.tempFileURL;
      if (url) {
        apply(url);
        return;
      }
      console.warn(label + " temp url missing", item);
    },
    fail(err) {
      console.warn(label + " cloud url failed", err);
    },
  });
}

function ensureFallbackBgm() {
  if (bgmFallback) return bgmFallback;
  try {
    bgmFallback = wx.createInnerAudioContext({ useWebAudioImplement: true });
  } catch (e) {
    bgmFallback = wx.createInnerAudioContext();
  }
  bgmFallback.loop = true;
  bgmFallback.obeyMuteSwitch = true;
  applyBgmVolume();
  bgmFallback.onCanplay(applyBgmVolume);
  bgmFallback.onPlay(applyBgmVolume);
  bgmFallback.onError(function (err) {
    console.warn("bgm error", err);
  });
  loadCloudUrl(cloudConfig.bgmFileID, "bgm", function (src) {
    if (!bgmFallback || !src) return;
    bgmFallback.src = src;
    applyBgmVolume();
    if (bgmWanted && bgmOn) playSafe(bgmFallback);
  });
  return bgmFallback;
}

function setSleepSrc(src) {
  if (!sleep || !src) return;
  sleep.src = src;
  if (sleepWanted) playSafe(sleep);
}

function ensureSleep() {
  if (sleep) return sleep;
  sleep = wx.createInnerAudioContext();
  sleep.loop = true;
  // sleep.volume = 0.75;
  sleep.obeyMuteSwitch = true;
  sleep.onError(function (err) {
    console.warn("sleep audio error", err);
  });
  loadCloudUrl(cloudConfig.sleepAudioFileID, "sleep audio", setSleepSrc);
  return sleep;
}

function ensureClick() {
  if (click) return click;
  click = wx.createInnerAudioContext();
  click.src = "/audio/click.mp3";
  // click.volume = 0.75;
  click.obeyMuteSwitch = true;
  click.onError(function (err) {
    console.warn("click error", err);
  });
  return click;
}

function applyBgm() {
  if (bgmWanted && bgmOn) {
    if (canWebAudio()) playWebBgm();
    else playSafe(ensureFallbackBgm());
    return;
  }
  suspendWeb();
  pauseSafe(bgmFallback, "bgm");
}

function playBgm() {
  bgmWanted = true;
  applyBgm();
}

function pauseBgm() {
  bgmWanted = false;
  suspendWeb();
  pauseSafe(bgmFallback, "bgm");
}

function toggleBgm() {
  bgmOn = !bgmOn;
  writeBgmOn(bgmOn);
  applyBgm();
  return bgmOn;
}

function syncSleep(sleeping) {
  sleepWanted = !!sleeping;
  if (sleepWanted) {
    playSafe(ensureSleep());
    return;
  }
  stopSafe(sleep, "sleep audio");
}

function resumeSleep() {
  if (sleepWanted) playSafe(ensureSleep());
}

function pauseSleep() {
  pauseSafe(sleep, "sleep audio");
}

function playClick() {
  // 部分机型需用户手势后才能播 BGM，点击时顺带拉起
  if (bgmWanted && bgmOn) {
    if (canWebAudio()) {
      resumeWeb();
      if (!bgmSource) playWebBgm();
    } else {
      playSafe(ensureFallbackBgm());
    }
  }
  if (sleepWanted) playSafe(ensureSleep());
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
  toggleBgm,
  isBgmOn,
  syncSleep,
  resumeSleep,
  pauseSleep,
  playClick,
};
