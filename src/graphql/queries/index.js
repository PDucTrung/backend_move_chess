const { GraphQLObjectType } = require('graphql');
const AccountQuery = require('./AccountQuery');
const GameQuery = require('./GameQuery');
const SkinQuery = require('./SkinQuery');
const TokenQuery = require('./TokenQuery');

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    accounts: {
      type: AccountQuery,
      resolve: () => ({}),
    },
    games: {
      type: GameQuery,
      resolve: () => ({}),
    },
    skins: {
      type: SkinQuery,
      resolve: () => ({}),
    },
    tokens: {
      type: TokenQuery,
      resolve: () => ({}),
    },
  },
});

module.exports = RootQuery;
