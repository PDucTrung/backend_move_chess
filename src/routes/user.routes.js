const controller = require("../controllers/userController");
const { authenticateToken } = require("../middleware/authMiddleware");

module.exports = function (app) {
  app.get("/profile", authenticateToken, controller.getProfile);
};
