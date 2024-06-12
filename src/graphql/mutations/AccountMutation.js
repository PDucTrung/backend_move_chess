const { GraphQLObjectType, GraphQLString } = require("graphql");
const MutationResponseType = require("../types/MutationResponseType");
const { applyMiddleware } = require('../../utils/middleware');
const { authenticateTokenGraphQL } = require('../../middleware/authMiddleware');
const db = require("../../models");
const Account = db.account;

const AccountMutation = new GraphQLObjectType({
  name: "AccountMutation",
  fields: {
    updateAccount: {
      type: MutationResponseType,
      args: {
        id: { type: GraphQLString },
        username: { type: GraphQLString },
        preferredLanguage: { type: GraphQLString },
      },
      async resolve(parent, args) {
        try {
          const account = await Account.findById(args.id);
          if (!account) {
            return { success: false, message: "Account not found" };
          }

          account.username = args.username || account.username;
          account.settings.preferredLanguage =
            args.preferredLanguage || account.settings.preferredLanguage;

          await account.save();
          return { success: true, message: "Account updated successfully" };
        } catch (err) {
          return { success: false, message: err.message };
        }
      },
    },
    banAccount: {
      type: MutationResponseType,
      args: {
        id: { type: GraphQLString },
        reason: { type: GraphQLString },
      },
      async resolve(parent, args) {
        try {
          const account = await Account.findById(args.id);
          if (!account) {
            return { success: false, message: "Account not found" };
          }

          account.isBanned = true;
          account.banReason = args.reason || "No reason provided";

          await account.save();
          return { success: true, message: "Account banned successfully" };
        } catch (err) {
          return { success: false, message: err.message };
        }
      },
    },
  },
});

module.exports = AccountMutation;
