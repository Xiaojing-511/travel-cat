function call(action, data) {
  return new Promise((resolve) => {
    if (typeof wx === "undefined" || !wx.cloud || !wx.cloud.callFunction) {
      resolve({ ok: false, code: "NETWORK", message: "cloud unavailable" });
      return;
    }
    const payload = Object.assign({}, data || {}, { action: action });
    delete payload.now;
    delete payload.openid;
    delete payload.userId;
    wx.cloud.callFunction({
      name: "player",
      data: payload,
      success(res) {
        resolve((res && res.result) || { ok: false, code: "INTERNAL" });
      },
      fail(err) {
        resolve({
          ok: false,
          code: "NETWORK",
          message: (err && err.errMsg) || "network",
        });
      },
    });
  });
}

module.exports = {
  call,
};
