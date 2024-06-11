require("dotenv").config();

module.exports = {
  AUTH0_SECRET: process.env.AUTH0_SECRET,
  AUTH0_BASE_URL: process.env.API_BASE_URL,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
  AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL,
};