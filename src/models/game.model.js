const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  players: [
    {
      playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
      color: { type: String, enum: ["black", "white"] },
      moves: [{ type: String }],
      skinUsed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skin" }],
      result: { type: String, enum: ["win", "loss", "draw"] },
    },
  ],
  arbiter:{ type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  datePlayed: { type: Date, default: Date.now },
  arbitrated: { type: Boolean, default: false },
});

module.exports = mongoose.model("Game", GameSchema);
