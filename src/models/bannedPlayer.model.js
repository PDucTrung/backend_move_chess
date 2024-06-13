const mongoose = require('mongoose');

const BannedPlayerSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  username: { type: String, required: true },
  reason: { type: String },
  bannedDate: { type: Date },
  bannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Account'}
});

module.exports = mongoose.model('BannedPlayer', BannedPlayerSchema);
