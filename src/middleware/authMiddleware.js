require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt.config");
const JWT_ACCESS_SECRET = jwtConfig.JWT_ACCESS_SECRET;
const db = require("../../src/models");
const { ROLES } = require("../utils/contants");
const User = db.account;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).send("No token provided");

  jwt.verify(token, JWT_ACCESS_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid token");
    req.user = user;
    next();
  });
};

const authenticateTokenGraphQL = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return next(new Error("No token provided"));

  jwt.verify(token, JWT_ACCESS_SECRET, (err, user) => {
    if (err) return next(new Error("Invalid token"));
    req.user = user;
    next();
  });
};

const authenticateAdminGraphQL = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return next(new Error("No token provided"));

  jwt.verify(token, JWT_ACCESS_SECRET, async (err, user) => {
    if (err) return next(new Error("Invalid token"));
    const account = await User.findById(user.userId).select("-password");

    if (!account) {
      return next(new Error("User not found"));
    }

    if (!account.roles.includes(ROLES.ADMIN)) {
      return next(new Error("Not authorized"));
    }

    req.user = user;
    next();
  });
};

const checkRoleAdmin = async function (req, res, next) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user.roles.includes(ROLES.ADMIN)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    next();
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};


const checkRoleArbitration = async function (req, res, next) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user.roles.includes(ROLES.ARBITRATION)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    next();
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
  authenticateToken,
  authenticateTokenGraphQL,
  authenticateAdminGraphQL,
  checkRoleAdmin,
  checkRoleArbitration
};
