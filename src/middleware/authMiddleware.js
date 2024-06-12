require("dotenv").config();
const jwt = require("jsonwebtoken");

const jwtConfig = require("../config/jwt.config");
const JWT_ACCESS_SECRET = jwtConfig.JWT_ACCESS_SECRET;

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).send("No token provided");

  jwt.verify(token, JWT_ACCESS_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid token");
    req.user = user;
    next();
  });
};
