require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLBoolean,
} = require("graphql");
const MutationResponseType = require("../types/MutationResponseType");
const { applyMiddleware } = require("../../utils/middleware");
const { authenticateTokenGraphQL } = require("../../middleware/authMiddleware");
const { sendEmail } = require("../../utils/emailService");
const {
  validatePassword,
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/utils");
const jwtConfig = require("../../config/jwt.config");
const API_BASE_URL = process.env.API_BASE_URL;
const JWT_ACCESS_SECRET = jwtConfig.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = jwtConfig.JWT_REFRESH_SECRET;
const EMAIL_SECRET = jwtConfig.EMAIL_SECRET;
const db = require("../../models");
const Account = db.account;

const AccountMutation = new GraphQLObjectType({
  name: "AccountMutation",
  fields: {
    register: {
      type: MutationResponseType,
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        redirectUrl: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        try {
          const existingAccount = await Account.findOne({ email: args.email });
          if (existingAccount) {
            return { success: false, message: "Email already in use" };
          }

          if (!validatePassword(args.password)) {
            return {
              success: false,
              message:
                "Password must be 6-50 characters long and include at least one number, one uppercase letter, one lowercase letter, and one special character",
            };
          }

          const hashedPassword = await bcrypt.hash(args.password, 10);
          const newAccount = new Account({
            email: args.email,
            password: hashedPassword,
            username: "user" + new Date().getTime(),
          });
          await newAccount.save();

          const token = jwt.sign({ userId: newAccount._id }, EMAIL_SECRET, {
            expiresIn: "1d",
          });
          const url =
            args.redirectUrl ||
            `${API_BASE_URL}/api/auth/confirmation/${token}`;

          await sendEmail(
            args.email,
            "Email Confirmation",
            `<a href="${url}">Click here to confirm your email</a>`
          );

          return {
            success: true,
            message:
              "Account registered! Please check your email to confirm your account.",
          };
        } catch (err) {
          return { success: false, message: err.message };
        }
      },
    },
    updateProfile: {
      type: MutationResponseType,
      args: {
        id: { type: GraphQLString },
        username: { type: GraphQLString },
        avatars: { type: new GraphQLList(GraphQLString) },
      },
      async resolve(parent, args) {
        try {
          const account = await Account.findById(args.id);
          if (!account) {
            return { success: false, message: "Account not found" };
          }

          account.username = args.username || account.username;
          account.avatars = args.avatars;

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
      resolve: applyMiddleware(
        authenticateTokenGraphQL,
        async (parent, args, context) => {
          try {
            const user = await Account.findById(context.req.user.userId);
            const isArbiter = user.arbitration.isArbiter;
            if (!isArbiter)
              return { success: false, message: "Permission denied" };
            const account = await Account.findById(args.id);
            if (!account) {
              return { success: false, message: "Account not found" };
            }

            account.isBaned = true;
            const warning = {
              reason: args.reason || "No reason provided",
            };
            account.warnings.push(warning);

            await account.save();
            return { success: true, message: "Account banned successfully" };
          } catch (err) {
            return { success: false, message: err.message };
          }
        }
      ),
    },
    updateArbitration: {
      type: MutationResponseType,
      args: {
        id: { type: GraphQLString },
        isArbiter: { type: GraphQLBoolean },
        kycVerified: { type: GraphQLBoolean },
        twoFactorAuthEnabled: { type: GraphQLBoolean },
      },
      async resolve(parent, args) {
        try {
          const account = await Account.findById(args.id);
          if (!account) {
            return { success: false, message: "Account not found" };
          }
          if (args.kycVerified) {
            account.arbitration.kycVerified = args.kycVerified;
          }
          if (args.twoFactorAuthEnabled) {
            account.arbitration.twoFactorAuthEnabled =
              args.twoFactorAuthEnabled;
          }
          if (args.isArbiter) {
            if (
              !account.arbitration.kycVerified &&
              !account.arbitration.twoFactorAuthEnabled
            )
              return {
                success: false,
                message: "Account not kycVerified or not enabled twoFactorAuth",
              };
            account.arbitration.isArbiter = args.isArbiter;
          }

          await account.save();
          return { success: true, message: "Account updated successfully" };
        } catch (err) {
          return { success: false, message: err.message };
        }
      },
    },
  },
});

module.exports = AccountMutation;
