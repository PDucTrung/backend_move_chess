const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLBoolean,
} = require("graphql");

const PlayerType = new GraphQLObjectType({
  name: "Player",
  fields: {
    playerId: { type: GraphQLString },
    color: { type: GraphQLString },
  },
});

const GameType = new GraphQLObjectType({
  name: "Game",
  fields: {
    id: { type: GraphQLString },
    players: { type: new GraphQLList(PlayerType) },
    moves: { type: new GraphQLList(GraphQLString) },
    result: { type: GraphQLString },
    datePlayed: { type: GraphQLString },
    skinUsed: { type: GraphQLString },
    arbitrated: { type: GraphQLBoolean },
  },
});

module.exports = GameType;
