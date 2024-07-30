const mongoose = require("mongoose");

const TournamentSchema = new mongoose.Schema({
  game_id: { type: String },
  player1: { type: String },
  player2: { type: String },
  board: { type: Object },
  score: { type: Number },
  turn_player: { type: String },
  move_number: { type: Number },
  fen: { type: String },
  tournamnetIndex: { type: Number },
});

module.exports = mongoose.model("Tournament", TournamentSchema);
