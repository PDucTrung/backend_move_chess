const controller = require("../controllers/userController");
const { authenticateToken } = require("../middleware/authMiddleware");

module.exports = function (app) {
  app.post("/profile", authenticateToken, controller.getProfile);
  app.post("/updateProfile", authenticateToken, controller.updateProfile);
};
