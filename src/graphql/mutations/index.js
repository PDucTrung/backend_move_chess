const { GraphQLObjectType } = require("graphql");
const AccountMutation = require("./AccountMutation");
const GameMutation = require("./GameMutation");
const SkinMutation = require("./SkinMutation");
const TokenMutation = require("./TokenMutation");

const RootMutation = new GraphQLObjectType({
  name: "RootMutationType",
  fields: {
    accounts: {
      type: AccountMutation,
      resolve: () => ({}),
    },
    games: {
      type: GameMutation,
      resolve: () => ({}),
    },
    skins: {
      type: SkinMutation,
      resolve: () => ({}),
    },
    tokens: {
      type: TokenMutation,
      resolve: () => ({}),
    },
  },
});

module.exports = RootMutation;
