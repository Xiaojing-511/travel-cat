/**
 * 发版审核用的示例旅行记忆。
 * 相册还没有真实明信片时展示，方便审核员点开列表和详情。
 * 用户第一次收到真实明信片后，这些示例不再出现。
 */
const TRIPS = require("./trips.js");

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const SPECS = [
  { id: "dali-lake-01", daysAgo: 1, travelHours: 8 },
  { id: "dali-flower-01", daysAgo: 3, travelHours: 14 },
  { id: "xinjiang-poplar-01", daysAgo: 6, travelHours: 22 },
  { id: "landmark-pagoda-01", daysAgo: 9, travelHours: 11 },
];

function tripById(id) {
  for (let i = 0; i < TRIPS.length; i++) {
    if (TRIPS[i].id === id) return TRIPS[i];
  }
  return null;
}

function buildReviewCards(now) {
  const origin = Number(now) || Date.now();
  const cards = [];
  for (let i = 0; i < SPECS.length; i++) {
    const spec = SPECS[i];
    const trip = tripById(spec.id);
    if (!trip) continue;
    const collectedAt = origin - spec.daysAgo * DAY_MS;
    const startedAt = collectedAt - spec.travelHours * HOUR_MS;
    const journaledAt =
      startedAt + Math.floor((collectedAt - startedAt) * 0.45);
    cards.push({
      id: "review-" + trip.id,
      templateId: trip.id,
      location: trip.location,
      image: trip.image || "",
      imageFileID: trip.imageFileID || "",
      journal: trip.journal,
      collectedAt,
      startedAt,
      journaledAt,
    });
  }
  cards.sort((a, b) => b.collectedAt - a.collectedAt);
  return cards;
}

function withReviewFallback(cards, now) {
  if (cards && cards.length) return cards;
  return buildReviewCards(now);
}

module.exports = {
  SPECS,
  buildReviewCards,
  withReviewFallback,
};
