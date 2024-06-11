const controller = require("../controllers/authController");
const { loginGoogle, loginFacebook } = require("../middleware/authMiddleware");

module.exports = function (app) {
  app.post("/register", controller.register);
  app.get("/api/auth/confirmation/:token", controller.confirmEmail);
  app.post("/login", controller.login);
  app.get("/auth/google", loginGoogle, controller.socialLogin);
  app.get("/auth/facebook", loginFacebook, controller.socialLogin);
  app.get("/callback", controller.callback);
  app.post("/refresh-token", controller.refreshToken);
  app.get("/auth/logout", controller.logout);
  app.post("/forgot-password", controller.forgotPassword);
  app.post("/reset-password/:token", controller.resetPassword);
};
