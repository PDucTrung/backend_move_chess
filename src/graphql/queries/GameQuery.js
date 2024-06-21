const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
} = require("graphql");
const { GameType } = require("../types/GameType");
const db = require("../../models");
const Game = db.game;

const GameQuery = new GraphQLObjectType({
  name: "GameQuery",
  fields: {
    games: {
      type: new GraphQLList(GameType),
      args: {
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt },
        sort: { type: GraphQLInt },
      },
      resolve(parent, args) {
        let { limit, offset, sort } = args;
        if (!limit) limit = 10;
        if (!offset) offset = 0;
        if (!sort) sort = -1;
        return Game.find().sort({ _id: sort }).skip(offset).limit(limit).exec();
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
      args: {
        playerId: { type: GraphQLString },
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt },
        sort: { type: GraphQLInt },
      },
      resolve(parent, args) {
        let { limit, offset, sort } = args;
        if (!limit) limit = 10;
        if (!offset) offset = 0;
        if (!sort) sort = -1;
        return Game.find({ "players.playerId": args.playerId })
          .sort({ _id: sort })
          .skip(offset)
          .limit(limit)
          .exec();
      },
    },
    gamesByArbiter: {
      type: new GraphQLList(GameType),
      args: {
        arbiter: { type: GraphQLString },
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt },
        sort: { type: GraphQLInt },
      },
      resolve(parent, args) {
        let { limit, offset, sort } = args;
        if (!limit) limit = 10;
        if (!offset) offset = 0;
        if (!sort) sort = -1;
        return Game.find({ "players.playerId": args.playerId })
          .sort({ _id: sort })
          .skip(offset)
          .limit(limit)
          .exec();
      },
    },
  },
});

module.exports = GameQuery;
