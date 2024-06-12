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
const passport = require("passport");
const session = require("express-session");
require("./src/services/passport.js");

const app = express();

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// Apply the rate limiting middleware to all requests
app.use(limiter);

app.use(
  session({
    secret: process.env.SESSION_SECRET, // session secret
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  })
);

// initialize passport and session
app.use(passport.initialize());
app.use(passport.session());

// ROUTERS
app.get("/", (req, res) => {
  res.send("Wellcome Move Chess!");
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
