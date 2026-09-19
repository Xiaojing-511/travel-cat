const game = require("../utils/game.js");

function advance(player, now, options) {
  const state = game.normalize(player, now);
  return game.tick(state, now, undefined, options || {});
}

module.exports = {
  advance,
};
