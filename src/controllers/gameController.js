require("dotenv").config();
const md5 = require("md5");
const db = require("../models");
const Game = db.game;
const { Chess } = require("chess.js");

exports.newGame = async (req, res) => {
  try {
    const time = Date.now();
    const id = md5(time);

    const chess = new Chess();

    const board = {
      game_id: id,
      player1: "",
      player2: "",
      board: chess.board(),
      score: 0,
      turn_player: chess.turn(),
      move_number: chess.moveNumber(),
      fen: chess.fen(),
    };

    const insert = await Game.create(board);
    console.log("7s200:new-game:insert", insert);

    res.status(200).json({ board });
  } catch (error) {
    console.error("Error creating game:", error);
    res.status(500).json({ error: "Failed to create game" });
  }
};

exports.loadGame = async (req, res) => {
  const { game_id } = req.query;
  const query = { game_id: game_id };
  const game = await Game.findOne(query);
  res.json({ game });
};

exports.getGames = async (req, res) => {
  const games = await Game.find();
  res.json({ status: 200, games });
};

exports.updateWinner = async (req, res) => {
  const { game_id } = req.body;
  const query = { game_id: game_id };
  console.log("7s200:query", query);

  try {
    const game = await Game.findOne(query);

    if (game) {
      const chess = new Chess(game.fen);

      if (game.isGameOver || game.isGameDraw) {
        const winner = chess.turn() === "w" ? "white" : "black";
        console.log("Winner is:", winner);

        const newDocs = {
          $set: {
            winner: winner,
          },
        };
        await Game.findOneAndUpdate(query, newDocs);

        res.json({
          status: "success",
          message: "Winner updated successfully",
          winner: winner,
        });
      } else {
        res.status(400).json({
          status: "error",
          message: "Game is not over yet, cannot update winner",
        });
      }
    } else {
      res.status(404).json({ status: "error", message: "Game not found" });
    }
  } catch (error) {
    console.error("Error updating winner:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};
