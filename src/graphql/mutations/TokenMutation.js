const { GraphQLObjectType, GraphQLString } = require('graphql');
const TokenType = require('../types/TokenType');
const MutationResponseType = require('../types/MutationResponseType');
const db = require("../../models");
const Token = db.token;

const TokenMutation = new GraphQLObjectType({
  name: 'TokenMutation',
  fields: {
    createToken: {
      type: TokenType,
      args: {
        userId: { type: GraphQLString },
        token: { type: GraphQLString },
      },
      async resolve(parent, args) {
        try {
          const newToken = new Token({
            userId: args.userId,
            token: args.token,
          });

          await newToken.save();
          return newToken;
        } catch (err) {
          throw new Error(err.message);
        }
      },
    },
    deleteToken: {
      type: MutationResponseType,
      args: {
        id: { type: GraphQLString },
      },
      async resolve(parent, args) {
        try {
          const token = await Token.findById(args.id);
          if (!token) {
            return { success: false, message: 'Token not found' };
          }

          await token.deleteOne();
          return { success: true, message: 'Token deleted successfully' };
        } catch (err) {
          return { success: false, message: err.message };
        }
      },
    },
  },
});

module.exports = TokenMutation;
