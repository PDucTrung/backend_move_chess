const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLBoolean,
} = require("graphql");
const MutationResponseType = require("../types/MutationResponseType");
const { PlayerInputType } = require("../types/GameType");
const db = require("../../models");
const Game = db.game;

const GameMutation = new GraphQLObjectType({
  name: "GameMutation",
  fields: {
    createGame: {
      type: MutationResponseType,
      args: {
        players: { type: new GraphQLList(PlayerInputType) },
        arbiter: { type: GraphQLString },
        arbitrated: { type: GraphQLBoolean },
      },
      async resolve(parent, args) {
        try {
          const newGame = new Game({
            players: args.players.map((player) => {
              let playerObj = {};
              playerObj.playerId = player.playerId;
              if (player.color) playerObj.color = player.color;
              if (player.moves) playerObj.moves = player.moves;
              if (player.skinUsed) playerObj.skinUsed = player.skinUsed;
              if (player.result) playerObj.result = player.result;
              return playerObj;
            }),
            arbiter: args.arbiter,
            arbitrated: args.arbitrated,
          });

          await newGame.save();
          return { success: true, message: "Game created successfully" };
        } catch (err) {
          return { success: false, message: err.message };
        }
      },
    },
    updateGame: {
      type: MutationResponseType,
      args: {
        id: { type: GraphQLString },
        players: { type: new GraphQLList(PlayerInputType) },
        arbiter: { type: GraphQLString },
        arbitrated: { type: GraphQLBoolean },
      },
      async resolve(parent, args) {
        try {
          const game = await Game.findById(args.id);
          if (!game) {
            return { success: false, message: "Game not found" };
          }

          game.players = args.players
            ? args.players.map((player) => {
                let playerObj = {};
                let playerClone = game.players.find(
                  (item) => item.playerId === player.playerId
                );
                playerObj = { ...playerClone };
                if (player.color) playerObj.color = player.color;
                if (player.moves) playerObj.moves = player.moves;
                if (player.skinUsed) playerObj.skinUsed = player.skinUsed;
                if (player.result) playerObj.result = player.result;
                return playerObj;
              })
            : game.players;
          game.arbiter = args.arbiter || game.arbiter;
          game.arbitrated =
            args.arbitrated !== undefined ? args.arbitrated : game.arbitrated;

          await game.save();
          return { success: true, message: "Game updated successfully" };
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
            return { success: false, message: "Game not found" };
          }

          await game.deleteOne();
          return { success: true, message: "Game deleted successfully" };
        } catch (err) {
          return { success: false, message: err.message };
        }
      },
    },
  },
});

module.exports = GameMutation;
