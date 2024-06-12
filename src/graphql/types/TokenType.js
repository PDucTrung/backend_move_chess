const { GraphQLObjectType, GraphQLString, GraphQLID } = require('graphql');

const TokenType = new GraphQLObjectType({
  name: 'Token',
  fields: () => ({
    id: { type: GraphQLID },
    userId: { type: GraphQLString },
    token: { type: GraphQLString },
    createdAt: { type: GraphQLString },
  }),
});

module.exports = TokenType;
