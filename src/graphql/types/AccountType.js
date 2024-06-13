const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLFloat,
} = require("graphql");

const WalletType = new GraphQLObjectType({
  name: "Wallet",
  fields: {
    chain: { type: GraphQLString },
    address: { type: GraphQLString },
  },
});

const GameHistoryType = new GraphQLObjectType({
  name: "GameHistory",
  fields: {
    gameId: { type: GraphQLString },
    moves: { type: new GraphQLList(GraphQLString) },
  },
});

const WinPercentageType = new GraphQLObjectType({
  name: "WinPercentage",
  fields: {
    black: { type: GraphQLFloat },
    white: { type: GraphQLFloat },
  },
});

const SettingsType = new GraphQLObjectType({
  name: "Settings",
  fields: {
    moveStyle: { type: GraphQLString },
    country: { type: GraphQLString },
    preferredLanguage: { type: GraphQLString },
  },
});

const SkinType = new GraphQLObjectType({
  name: "SkinType",
  fields: {
    skinId: { type: GraphQLString },
    isActive: { type: GraphQLBoolean },
    activationDate: { type: GraphQLString },
  },
});

const WarningType = new GraphQLObjectType({
  name: "Warning",
  fields: {
    date: { type: GraphQLString },
    reason: { type: GraphQLString },
    bannedBy: { type: GraphQLString },
  },
});

const ArbitrationType = new GraphQLObjectType({
  name: "Arbitration",
  fields: {
    isArbiter: { type: GraphQLBoolean },
    gamesArbitrated: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "ArbitratedGame",
          fields: {
            gameId: { type: GraphQLString },
          },
        })
      ),
    },
    totalGamesArbitrated: { type: GraphQLInt },
    kycVerified: { type: GraphQLBoolean },
    twoFactorAuthEnabled: { type: GraphQLBoolean },
  },
});

const OauthProviderType = new GraphQLObjectType({
  name: "OauthProvider",
  fields: {
    provider: { type: GraphQLString },
    providerId: { type: GraphQLString },
  },
});

const AccountType = new GraphQLObjectType({
  name: "Account",
  fields: {
    id: { type: GraphQLString },
    email: { type: GraphQLString },
    username: { type: GraphQLString },
    isVerified: { type: GraphQLBoolean },
    avatars: { type: new GraphQLList(GraphQLString) },
    wallets: { type: new GraphQLList(WalletType) },
    gamesPlayed: { type: GraphQLInt },
    tournamentsPlayed: { type: GraphQLInt },
    gameHistory: { type: new GraphQLList(GameHistoryType) },
    puzzlesCompleted: { type: GraphQLInt },
    gamesAnalyzed: { type: GraphQLInt },
    winPercentage: { type: WinPercentageType },
    settings: { type: SettingsType },
    joinedDate: { type: GraphQLString },
    skins: { type: new GraphQLList(SkinType) },
    isBaned: { type: GraphQLBoolean },
    warnings: { type: new GraphQLList(WarningType) },
    arbitration: { type: ArbitrationType },
    oauthProviders: { type: new GraphQLList(OauthProviderType) },
  },
});

module.exports = AccountType;
