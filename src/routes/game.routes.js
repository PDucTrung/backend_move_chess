const controller = require("../controllers/gameController");
const { authenticateToken } = require("../middleware/authMiddleware");

module.exports = function (app) {
  app.post("/newGame", authenticateToken, controller.newGame);
  app.get("/loadGame", authenticateToken, controller.loadGame);
  app.get("/getGames", authenticateToken, controller.getGames);
  app.post("/updateWinner", authenticateToken, controller.updateWinner);
};
