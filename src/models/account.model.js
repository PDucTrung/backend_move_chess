const mongoose = require("mongoose");
const { ROLES_ACCOUNT, SOCIALS_LIST, ROLES } = require("../utils/contants");

const AccountSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  username: { type: String, unique: true },
  password: { type: String },
  isVerified: { type: Boolean, default: false },
  avatars: [{ type: String, default: [] }],
  wallets: [
    {
      chain: { type: String },
      address: { type: String },
    },
  ],
  gamesPlayed: { type: Number, default: 0 },
  tournamentsPlayed: { type: Number, default: 0 },
  gameHistory: [
    {
      gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
      moves: [{ type: String }],
    },
  ],
  puzzlesCompleted: { type: Number, default: 0 },
  gamesAnalyzed: { type: Number, default: 0 },
  winPercentage: {
    black: { type: Number, default: 0 },
    white: { type: Number, default: 0 },
  },
  settings: {
    moveStyle: { type: String, enum: ["click", "drag"], default: "click" },
    country: { type: String },
    preferredLanguage: { type: String },
  },
  joinedDate: { type: Date, default: Date.now },
  skins: [
    {
      skinId: { type: mongoose.Schema.Types.ObjectId, ref: "Skin" },
      isActive: { type: Boolean, default: false },
      activationDate: { type: Date },
    },
  ],
  isBaned: { type: Boolean, default: false },
  roles: {
    type: [String],
    enum: ROLES_ACCOUNT,
    default: [ROLES.PLAYER],
  },
  warnings: [
    {
      date: { type: Date, default: Date.now },
      reason: { type: String },
      bannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    },
  ],
  arbitration: {
    gamesArbitrated: [
      {
        gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
      },
    ],
    totalGamesArbitrated: { type: Number, default: 0 },
  },
  oauthProviders: [
    {
      provider: { type: String, enum: SOCIALS_LIST },
      providerId: { type: String },
    },
  ],
  kycVerifiedId: { type: String },
  kycVerified: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  twoFactorAuthEnabled: { type: Boolean, default: false },
});

module.exports = mongoose.model("Account", AccountSchema);
