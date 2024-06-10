require("dotenv").config();

module.exports = {
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  EMAIL_SECRET: process.env.EMAIL_SECRET,
};

