const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  game_id: { type: String },
  player1: { type: String },
  player2: { type: String },
  board: { type: Object },
  score: { type: Number },
  turn_player: { type: String },
  move_number: { type: Number },
  fen: { type: String },
  winner: { type: String },
  isGameOver: { type: Boolean },
  isGameDraw: { type: Boolean },
  players: [
    {
      playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
      color: { type: String, enum: ["black", "white"] },
      moves: [{ type: String }],
      skinUsed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skin" }],
      result: { type: String, enum: ["win", "loss", "draw"] },
    },
  ],
  arbiter: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  datePlayed: { type: Date, default: Date.now },
  arbitrated: { type: Boolean, default: false },
});

module.exports = mongoose.model("Game", GameSchema);
