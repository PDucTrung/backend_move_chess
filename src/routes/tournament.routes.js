const controller = require("../controllers/tournamentContoller");

module.exports = function (app) {
  app.get("/loadTournamentGame", controller.loadTournamentGame);
};
