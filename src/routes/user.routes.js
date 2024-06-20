const controller = require("../controllers/userController");
const {
  authenticateToken,
  checkRoleAdmin,
} = require("../middleware/authMiddleware");

module.exports = function (app) {
  app.post("/profile", authenticateToken, controller.getProfile);
  app.post("/updateProfile", authenticateToken, controller.updateProfile);
  app.post("/add-role", authenticateToken, checkRoleAdmin, controller.addRole);
  app.post(
    "/remove-role",
    authenticateToken,
    checkRoleAdmin,
    controller.removeRole
  );
};
