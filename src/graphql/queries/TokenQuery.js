const { GraphQLObjectType, GraphQLList, GraphQLString } = require('graphql');
const TokenType = require('../types/TokenType');
const db = require("../../models");
const Token = db.token;

const TokenQuery = new GraphQLObjectType({
  name: 'TokenQuery',
  fields: {
    tokens: {
      type: new GraphQLList(TokenType),
      resolve() {
        return Token.find().exec();
      },
    },
    tokenById: {
      type: TokenType,
      args: { id: { type: GraphQLString } },
      resolve(parent, args) {
        return Token.findById(args.id).exec();
      },
    },
    tokensByUserId: {
      type: new GraphQLList(TokenType),
      args: { userId: { type: GraphQLString } },
      resolve(parent, args) {
        return Token.find({ userId: args.userId }).exec();
      },
    },
  },
});

module.exports = TokenQuery;
