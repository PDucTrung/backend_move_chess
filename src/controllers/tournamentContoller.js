require("dotenv").config();
const db = require("../models");
const Tournament = db.tournament;

exports.loadTournamentGame = async (req, res) => {
  const { game_id } = req.query;
  const query = { game_id: game_id };
  const game = await Tournament.findOne(query);

  res.json({ game });
};
