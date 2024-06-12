const { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLBoolean } = require('graphql');
const MutationResponseType = require('../types/MutationResponseType');
const db = require("../../models");
const Game = db.game;

const GameMutation = new GraphQLObjectType({
  name: 'GameMutation',
  fields: {
    createGame: {
      type: MutationResponseType,
      args: {
        players: { type: new GraphQLList(GraphQLString) },
        moves: { type: new GraphQLList(GraphQLString) },
        result: { type: GraphQLString },
        skinUsed: { type: GraphQLString },
        arbitrated: { type: GraphQLBoolean },
      },
      async resolve(parent, args) {
        try {
          const newGame = new Game({
            players: args.players.map(playerId => ({ playerId })),
            moves: args.moves,
            result: args.result,
            skinUsed: args.skinUsed,
            arbitrated: args.arbitrated,
          });

          await newGame.save();
          return { success: true, message: 'Game created successfully' };
        } catch (err) {
          return { success: false, message: err.message };
        }
      },
    },
    updateGame: {
      type: MutationResponseType,
      args: {
        id: { type: GraphQLString },
        players: { type: new GraphQLList(GraphQLString) },
        moves: { type: new GraphQLList(GraphQLString) },
        result: { type: GraphQLString },
        skinUsed: { type: GraphQLString },
        arbitrated: { type: GraphQLBoolean },
      },
      async resolve(parent, args) {
        try {
          const game = await Game.findById(args.id);
          if (!game) {
            return { success: false, message: 'Game not found' };
          }

          game.players = args.players ? args.players.map(playerId => ({ playerId })) : game.players;
          game.moves = args.moves || game.moves;
          game.result = args.result || game.result;
          game.skinUsed = args.skinUsed || game.skinUsed;
          game.arbitrated = args.arbitrated !== undefined ? args.arbitrated : game.arbitrated;

          await game.save();
          return { success: true, message: 'Game updated successfully' };
        } catch (err) {
          return { success: false, message: err.message };
        }
      },
    },
    deleteGame: {
      type: MutationResponseType,
      args: {
        id: { type: GraphQLString },
      },
      async resolve(parent, args) {
        try {
          const game = await Game.findById(args.id);
          if (!game) {
            return { success: false, message: 'Game not found' };
          }

          await game.remove();
          return { success: true, message: 'Game deleted successfully' };
        } catch (err) {
          return { success: false, message: err.message };
        }
      },
    },
  },
});

module.exports = GameMutation;
