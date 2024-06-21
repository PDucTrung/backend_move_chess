const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
} = require("graphql");
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
      args: {
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt },
        sort: { type: GraphQLInt },
      },
      resolve: applyMiddleware(authenticateAdminGraphQL, (parent, args) => {
        let { limit, offset, sort } = args;
        if (!limit) limit = 10;
        if (!offset) offset = 0;
        if (!sort) sort = -1;
        return Account.find()
          .sort({ _id: sort })
          .skip(offset)
          .limit(limit)
          .select("-password")
          .exec();
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
      args: {
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt },
        sort: { type: GraphQLInt },
      },
      resolve: applyMiddleware(authenticateAdminGraphQL, (parent, args) => {
        let { limit, offset, sort } = args;
        if (!limit) limit = 10;
        if (!offset) offset = 0;
        if (!sort) sort = -1;
        return Account.find({ isBanned: true })
          .sort({ _id: sort })
          .skip(offset)
          .limit(limit)
          .select("-password")
          .exec();
      }),
    },
  },
});

module.exports = AccountQuery;
