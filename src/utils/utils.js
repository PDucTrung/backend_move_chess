require("dotenv").config();
const validator = require('validator');
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt.config");
const JWT_ACCESS_SECRET = jwtConfig.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = jwtConfig.JWT_REFRESH_SECRET;

module.exports.validatePassword = (password) => {
  const minLength = 6;
  const maxLength = 50;
  const hasNumber = /\d/;
  const hasUpperCase = /[A-Z]/;
  const hasLowerCase = /[a-z]/;
  const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/;

  if (
    !validator.isLength(password, { min: minLength, max: maxLength }) ||
    !hasNumber.test(password) ||
    !hasUpperCase.test(password) ||
    !hasLowerCase.test(password) ||
    !hasSpecialCharacter.test(password)
  ) {
    return false;
  }

  return true;
};

module.exports.generateAccessToken = (userId) => {
  return jwt.sign({ userId }, JWT_ACCESS_SECRET, { expiresIn: "15m" });
};

module.exports.generateRefreshToken = (userId) => {
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
  return refreshToken;
};