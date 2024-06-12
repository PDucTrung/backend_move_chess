const { GraphQLObjectType, GraphQLList, GraphQLString } = require('graphql');
const GameType = require('../types/GameType');
const db = require("../../models");
const Game = db.game;

const GameQuery = new GraphQLObjectType({
  name: 'GameQuery',
  fields: {
    games: {
      type: new GraphQLList(GameType),
      resolve() {
        return Game.find().exec();
      },
    },
    gameById: {
      type: GameType,
      args: { id: { type: GraphQLString } },
      resolve(parent, args) {
        return Game.findById(args.id).exec();
      },
    },
    gamesByPlayerId: {
      type: new GraphQLList(GameType),
      args: { playerId: { type: GraphQLString } },
      resolve(parent, args) {
        return Game.find({ 'players.playerId': args.playerId }).exec();
      },
    },
  },
});

module.exports = GameQuery;
