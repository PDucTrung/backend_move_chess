const { GraphQLObjectType, GraphQLList, GraphQLString } = require("graphql");
const AccountType = require("../types/AccountType");
const { applyMiddleware } = require("../../utils/middleware");
const {
  authenticateTokenGraphQL,
  authenticateAdminGraphQL,
} = require("../../middleware/authMiddleware");
const db = require("../../models");
const Account = db.account;

const AccountQuery = new GraphQLObjectType({
  name: "AccountQuery",
  fields: {
    accounts: {
      type: new GraphQLList(AccountType),
      resolve: applyMiddleware(authenticateAdminGraphQL, () => {
        return Account.find().select("-password").exec();
      }),
    },
    accountById: {
      type: AccountType,
      args: { id: { type: GraphQLString } },
      resolve: applyMiddleware(authenticateAdminGraphQL, (parent, args) => {
        return Account.findById(args.id).select("-password").exec();
      }),
    },
    accountByEmail: {
      type: AccountType,
      args: { email: { type: GraphQLString } },
      resolve: applyMiddleware(authenticateAdminGraphQL, (parent, args) => {
        return Account.findOne({ email: args.email })
          .select("-password")
          .exec();
      }),
    },
    bannedAccounts: {
      type: new GraphQLList(AccountType),
      resolve: applyMiddleware(authenticateAdminGraphQL, () => {
        return Account.find({ isBanned: true }).select("-password").exec();
      }),
    },
  },
});

module.exports = AccountQuery;
