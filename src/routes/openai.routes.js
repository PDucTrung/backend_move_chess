const controller = require("../controllers/openAIController");

module.exports = function (app) {
  app.post("/openaiChat", controller.openaiChat);
};
