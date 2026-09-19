const store = require("../../utils/store.js");
const game = require("../../utils/game.js");
const tripImage = require("../../utils/tripImage.js");
const TRIPS = require("../../data/trips.js");

const tripById = {};
TRIPS.forEach((trip) => {
  tripById[trip.id] = trip;
});

Page({
  data: {
    card: null,
  },

  onLoad(query) {
    const id = decodeURIComponent(query.id || "");
    const cached = store.loadCardsCache();
    const card = (cached || []).find((item) => item.id === id);
    if (!card) {
      wx.showToast({ title: "这封信不见了", icon: "none" });
      setTimeout(() => wx.navigateBack(), 400);
      return;
    }
    const template = card.templateId && tripById[card.templateId];
    this.setData({
      card: {
        ...card,
        image: tripImage.resolveTripImage(template || card),
        dateText: game.formatDateTime(card.journaledAt || card.collectedAt),
      },
    });
  },

  onImgError() {
    if (!this.data.card) return;
    this.setData({
      card: { ...this.data.card, image: tripImage.MOCK },
    });
  },
});
