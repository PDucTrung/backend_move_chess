const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLBoolean,
  GraphQLInputObjectType
} = require("graphql");

const PlayerType = new GraphQLObjectType({
  name: "Player",
  fields: {
    playerId: { type: GraphQLString },
    color: { type: GraphQLString },
    moves: { type: new GraphQLList(GraphQLString) },
    skinUsed: { type: new GraphQLList(GraphQLString) },
    result: { type: GraphQLString },
  },
});

const GameType = new GraphQLObjectType({
  name: "Game",
  fields: {
    id: { type: GraphQLString },
    players: { type: new GraphQLList(PlayerType) },
    arbiter: { type: GraphQLString },
    datePlayed: { type: GraphQLString },
    arbitrated: { type: GraphQLBoolean },
  },
});

const PlayerInputType = new GraphQLInputObjectType({
  name: "PlayerInput",
  fields: () => ({
    playerId: { type: GraphQLString },
    color: { type: GraphQLString },
    moves: { type: new GraphQLList(GraphQLString) },
    skinUsed: { type: new GraphQLList(GraphQLString) },
    result: { type: GraphQLString },
  }),
});

module.exports = {GameType, PlayerInputType};
