const { GraphQLObjectType, GraphQLList, GraphQLString } = require('graphql');
const AccountType = require('../types/AccountType');
const { applyMiddleware } = require('../../utils/middleware');
const { authenticateTokenGraphQL } = require('../../middleware/authMiddleware');
const db = require("../../models");
const Account = db.account;

const AccountQuery = new GraphQLObjectType({
  name: 'AccountQuery',
  fields: {
    accounts: {
      type: new GraphQLList(AccountType),
      resolve: applyMiddleware(authenticateTokenGraphQL, () => {
        return Account.find().exec();
      }),
    },
    accountById: {
      type: AccountType,
      args: { id: { type: GraphQLString } },
      resolve: applyMiddleware(authenticateTokenGraphQL, (parent, args) => {
        return Account.findById(args.id).exec();
      }),
    },
    accountByEmail: {
      type: AccountType,
      args: { email: { type: GraphQLString } },
      resolve: applyMiddleware(authenticateTokenGraphQL, (parent, args) => {
        return Account.findOne({ email: args.email }).exec();
      }),
    },
    bannedAccounts: {
      type: new GraphQLList(AccountType),
      resolve: applyMiddleware(authenticateTokenGraphQL, () => {
        return Account.find({ isBanned: true }).exec();
      }),
    },
  },
});

module.exports = AccountQuery;
