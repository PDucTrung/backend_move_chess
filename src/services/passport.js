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
      const email = profile["emails"][0].value;
      const provider = profile.provider;
      const providerId = profile.id;

      const existingUser = await User.findOne({ email: email });

      if (existingUser) {
        const existingProvider = existingUser.oauthProviders.find(
          (p) => p.provider === provider && p.providerId === providerId
        );

        if (!existingProvider) {
          // Thêm provider mới nếu chưa tồn tại
          existingUser.oauthProviders.push({ provider, providerId });
          await existingUser.save();
        }
        return done(null, existingUser);
      } else {
        let username = profile["name"]["givenName"];
        const existingUsername = await User.findOne({ username: username });

        if (existingUsername) {
          username = profile["name"]["givenName"] + new Date().getTime();
        }

        const newUser = await User.create({
          email: email,
          username: username,
          isVerified: true,
          oauthProviders: [
            {
              provider: provider,
              providerId: providerId,
            },
          ],
        });

        return done(null, newUser);
      }
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
