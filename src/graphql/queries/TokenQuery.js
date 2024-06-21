const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
} = require("graphql");
const TokenType = require("../types/TokenType");
const db = require("../../models");
const Token = db.token;

const TokenQuery = new GraphQLObjectType({
  name: "TokenQuery",
  fields: {
    tokens: {
      type: new GraphQLList(TokenType),
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
        return Token.find()
          .sort({ _id: sort })
          .skip(offset)
          .limit(limit)
          .exec();
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
      args: {
        userId: { type: GraphQLString },
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt },
        sort: { type: GraphQLInt },
      },
      resolve(parent, args) {
        let { limit, offset, sort } = args;
        if (!limit) limit = 10;
        if (!offset) offset = 0;
        if (!sort) sort = -1;
        return Token.find({ userId: args.userId })
          .sort({ _id: sort })
          .skip(offset)
          .limit(limit)
          .exec();
      },
    },
  },
});

module.exports = TokenQuery;
