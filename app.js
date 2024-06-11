require("dotenv").config();
let mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const rateLimit = require("express-rate-limit");
const dbConfig = require("./src/config/db.config.js");
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  max: 1000, // Limit each IP to 60 requests per `window` (here, per 1 minute)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
const { auth } = require("express-openid-connect");
// Auth0 config
const auth0Config = require("./src/config/auth0.config.js");
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: auth0Config.AUTH0_SECRET,
  baseURL: auth0Config.AUTH0_BASE_URL,
  clientID: auth0Config.AUTH0_CLIENT_ID,
  issuerBaseURL: auth0Config.AUTH0_ISSUER_BASE_URL,
  routes: {
    login: false,
    // postLogoutRedirect: `${process.env.API_BASE_URL}/logout`,
  },
};

const app = express();

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// Apply the rate limiting middleware to all requests
app.use(limiter);
// Apply auth0
app.use(auth(config));

// ROUTERS
app.get("/", (req, res) => {
  // res.send("Wellcome Move Chess!");
  const isLogin = req.oidc.isAuthenticated();
  res.send(
    isLogin ? "Logged in" : "Logged out",
  );
});

require("./src/routes/auth.routes.js")(app);
require("./src/routes/user.routes.js")(app);

const DATABASE_HOST = dbConfig.DB_HOST;
const DATABASE_PORT = dbConfig.DB_PORT;
const DATABASE_NAME = dbConfig.DB_NAME;
const DB_CONNECTOR = dbConfig.DB_CONNECTOR;
const CONNECTION_STRING = `${DB_CONNECTOR}://${DATABASE_HOST}:${DATABASE_PORT}`;

mongoose.set("strictQuery", false);
const connectDb = () => {
  return mongoose.connect(CONNECTION_STRING, {
    useNewUrlParser: true,
    dbName: DATABASE_NAME,
    maxPoolSize: 50,
  });
};

const PORT = process.env.PORT || 3000;
connectDb().then(async () => {
  app.listen(PORT, () => {
    console.log(`API running → PORT ${PORT}!`);
  });
});
