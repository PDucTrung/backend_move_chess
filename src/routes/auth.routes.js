const passport = require("passport");
const controller = require("../controllers/authController");

module.exports = function (app) {
  app.post("/register", controller.register);
  app.get("/api/auth/confirmation/:token", controller.confirmEmail);
  app.post("/login", controller.login);
  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["email", "profile"],
    })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      access_type: "offline",
      scope: ["email", "profile"],
    }),
    controller.callback
  );
  app.post("/refresh-token", controller.refreshToken);
  app.get("/auth/logout", controller.logout);
  app.post("/forgot-password", controller.forgotPassword);
  app.post("/reset-password/:token", controller.resetPassword);
};
