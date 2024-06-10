const GameSchema = new mongoose.Schema({
  players: [
    {
      playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
      color: { type: String, enum: ["black", "white"] },
    },
  ],
  moves: [{ type: String }],
  result: { type: String, enum: ["win", "loss", "draw"] },
  datePlayed: { type: Date, default: Date.now },
  skinUsed: { type: mongoose.Schema.Types.ObjectId, ref: "Skin" },
  arbitrated: { type: Boolean, default: false },
});

module.exports = mongoose.model("Game", GameSchema);
