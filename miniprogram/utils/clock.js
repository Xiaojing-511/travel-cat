let serverNow = 0;
let receivedAt = 0;

function monotonic() {
  try {
    if (typeof wx !== "undefined" && wx.getPerformance) {
      const perf = wx.getPerformance();
      if (perf && typeof perf.now === "function") return perf.now();
    }
  } catch (e) {}
  return Date.now();
}

function setServerNow(now) {
  const value = Number(now) || 0;
  if (!value) return;
  serverNow = value;
  receivedAt = monotonic();
}

function approxNow() {
  if (!serverNow) return Date.now();
  return serverNow + Math.max(0, monotonic() - receivedAt);
}

module.exports = {
  setServerNow,
  approxNow,
  monotonic,
};
