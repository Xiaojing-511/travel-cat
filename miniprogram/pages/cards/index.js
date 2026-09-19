const game = require("../../utils/game.js");
const store = require("../../utils/store.js");
const audio = require("../../utils/audio.js");
const tripImage = require("../../utils/tripImage.js");
const TRIPS = require("../../data/trips.js");

const tripById = {};
TRIPS.forEach((trip) => {
  tripById[trip.id] = trip;
});

function withTripImage(card) {
  const template = card.templateId && tripById[card.templateId];
  const image = tripImage.resolveTripImage(template || card);
  return {
    ...card,
    image,
    dateText: game.formatDateTime(card.startedAt || card.collectedAt),
    detailDateText: game.formatDateTime(card.journaledAt || card.collectedAt),
  };
}

Page({
  data: {
    cards: [],
    empty: true,
    openCard: null,
  },

  async onShow() {
    const cleared = await store.clearUnread();
    const listed = await store.listCards();
    if (cleared.offline || listed.offline) {
      wx.showToast({ title: "网络不可用", icon: "none" });
    }
    const cards = (listed.cards || []).map((card) => withTripImage(card));
    this.setData({
      empty: cards.length === 0,
      cards,
    });
  },

  openCard(e) {
    audio.playClick();
    const id = e.currentTarget.dataset.id;
    const card = this.data.cards.find((item) => item.id === id);
    if (card) this.setData({ openCard: card });
  },

  closeCard() {
    audio.playClick();
    this.setData({ openCard: null });
  },

  onImgError(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) {
      if (this.data.openCard) {
        this.setData({
          openCard: { ...this.data.openCard, image: tripImage.MOCK },
        });
      }
      return;
    }
    const cards = this.data.cards.map((card) =>
      card.id === id ? { ...card, image: tripImage.MOCK } : card
    );
    const openCard =
      this.data.openCard && this.data.openCard.id === id
        ? { ...this.data.openCard, image: tripImage.MOCK }
        : this.data.openCard;
    this.setData({ cards, openCard });
  },

  preventMove() {},
});
