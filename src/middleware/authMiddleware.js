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

exports.loginGoogle = async (req, res, next) => {
  // Check if the user is authenticated
  const isLogin = req.oidc.isAuthenticated();
  if (!isLogin) {
    // Redirect to Google login
    return res.oidc.login({
      authorizationParams: {
        connection: "google-oauth2",
        // redirect_uri: `${process.env.API_BASE_URL}`,
      },
    });
  }
  next();
};

exports.loginFacebook = async (req, res, next) => {
  const isLogin = req.oidc.isAuthenticated();
  if (!isLogin)
    return res.oidc.login({
      authorizationParams: {
        connection: "facebook",
        // redirect_uri: `${process.env.API_BASE_URL}`,
      },
    });
  next();
};
