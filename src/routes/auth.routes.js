const passport = require("passport");
const controller = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

module.exports = function (app) {
  app.post("/register", controller.register);
  app.get("/api/auth/confirmation/:token", controller.confirmEmail);
  app.post("/auth/login", controller.login);
  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["email", "profile"],
      prompt: "select_account",
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
  app.post("/auth/enable2FA", authenticateToken, controller.enable2FA);
  app.post("/auth/disable2FA", authenticateToken, controller.disable2FA);
  app.post("/auth/verify2FA", authenticateToken, controller.verify2FA);
};
