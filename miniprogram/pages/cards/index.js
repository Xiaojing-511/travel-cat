const game = require("../../utils/game.js");
const store = require("../../utils/store.js");
const audio = require("../../utils/audio.js");
const tripImage = require("../../utils/tripImage.js");
const TRIPS = require("../../data/trips.js");
const { pickBackText } = require("../../data/back.js");

const tripById = {};
TRIPS.forEach((trip) => {
  tripById[trip.id] = trip;
});

function withTripImage(card, breedId) {
  const dateText = game.formatListDateTime(card.startedAt || card.collectedAt);
  if (game.isForgotCard(card)) {
    return {
      ...card,
      forgot: true,
      forgotText: pickBackText(card.id || card.startedAt || card.collectedAt),
      dateText,
    };
  }
  const presented = game.presentCard(card, breedId);
  const template = presented.templateId && tripById[presented.templateId];
  const image = tripImage.resolveTripImage(
    presented.imageFileID ? presented : template || presented,
  );
  return {
    ...presented,
    image,
    dateText,
    detailDateText: game.formatDateTime(card.journaledAt || card.collectedAt),
  };
}

function visibleCards(cards, filter) {
  if (filter === "photo") {
    return cards.filter((card) => !card.forgot);
  }
  return cards;
}

Page({
  data: {
    filter: "all",
    allCards: [],
    cards: [],
    loading: true,
    empty: false,
    openCard: null,
  },

  onLoad() {
    wx.showShareMenu({
      menus: ["shareAppMessage", "shareTimeline"],
    });
  },

  onShareAppMessage() {
    return {
      title: "小咪手记",
      path: "/pages/cards/index",
    };
  },

  onShareTimeline() {
    return {
      title: "小咪手记",
    };
  },

  async onShow() {
    if (!this.data.allCards.length) {
      this.setData({ loading: true, empty: false });
    }
    const listed = await store.listCards();
    if (listed.offline) {
      wx.showToast({ title: "网络不可用", icon: "none" });
    }
    const player = store.load();
    const allCards = game.sortCardsByListDate(listed.cards || []).map((card) =>
      withTripImage(card, player && player.breed)
    );
    const cards = visibleCards(allCards, this.data.filter);
    this.setData({
      loading: false,
      empty: cards.length === 0,
      allCards,
      cards,
    });
  },

  setFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    if (!filter || filter === this.data.filter) return;
    audio.playClick();
    const cards = visibleCards(this.data.allCards, filter);
    this.setData({
      filter,
      cards,
      empty: cards.length === 0,
    });
  },

  openCard(e) {
    audio.playClick();
    const id = e.currentTarget.dataset.id;
    const card = this.data.cards.find((item) => item.id === id);
    if (!card) return;
    this.setData({ openCard: card });
    if (card.unread) this.markRead(card.id);
  },

  async markRead(id) {
    const result = await store.readCard(id);
    if (!result || !result.ok) {
      if (result && result.offline) {
        wx.showToast({ title: "网络不可用", icon: "none" });
      }
      return;
    }
    const patch = (card) =>
      card.id === id ? { ...card, unread: false } : card;
    const allCards = this.data.allCards.map(patch);
    const cards = this.data.cards.map(patch);
    const openCard =
      this.data.openCard && this.data.openCard.id === id
        ? { ...this.data.openCard, unread: false }
        : this.data.openCard;
    this.setData({ allCards, cards, openCard });
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
    const patch = (card) =>
      card.id === id ? { ...card, image: tripImage.MOCK } : card;
    const allCards = this.data.allCards.map(patch);
    const cards = this.data.cards.map(patch);
    const openCard =
      this.data.openCard && this.data.openCard.id === id
        ? { ...this.data.openCard, image: tripImage.MOCK }
        : this.data.openCard;
    this.setData({ allCards, cards, openCard });
  },

  preventMove() {},
});
