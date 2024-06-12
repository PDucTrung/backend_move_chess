// import necessary dependencies
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../models");
const User = db.account;

//initialize
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // google client id
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // google client secret
      // the callback url added while creating the Google auth app on the console
      callbackURL: `${process.env.API_BASE_URL}/auth/google/callback`,
      passReqToCallback: true,
    },

    // returns the authenticated email profile
    async function (request, accessToken, refreshToken, profile, done) {
      const existMail = await User.findOne({
        email: profile["emails"][0].value,
      });
      let username = profile["name"]["givenName"];
      const existUsername = await User.findOne({ username: username });
      if (!existMail) {
        if (existUsername)
          username = profile["name"]["givenName"] + new Date().getTime();
        await User.create({
          email: profile["emails"][0].value,
          username: username,
          isVerified: true,
          oauthProviders: [
            {
              provider: profile.provider,
              providerId: profile.id,
            },
          ],
        });
      }
      const user = await User.findOne({ email: profile["emails"][0].value });
      return done(null, user);
    }
  )
);

// function to serialize a user/profile object into the session
passport.serializeUser(function (user, done) {
  done(null, user);
});

// function to deserialize a user/profile object into the session
passport.deserializeUser(function (user, done) {
  done(null, user);
});
