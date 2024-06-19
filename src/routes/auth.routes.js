const passport = require("passport");
const controller = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

module.exports = function (app) {
  app.post("/auth/register", controller.register);
  app.get("/api/auth/confirmation/:token", controller.confirmEmail);
  app.post("/auth/resend-verification", controller.resendEmail);
  app.post("/check-verify-email", controller.checkVerifyEmail);
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
      failureRedirect: `${process.env.REDIRECT_URL}/signin`,
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
