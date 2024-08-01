require("dotenv").config();
const mongoose = require("mongoose");
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const ChessV2 = require("chess.js").Chess;
const db = require("./src/models/index.js");
const jwtConfig = require("./src/config/jwt.config.js");
const JWT_ACCESS_SECRET = jwtConfig.JWT_ACCESS_SECRET;

const Game = db.game;
const Tournament = db.tournament;
const User = db.account;

const PORT = process.env.WSS2_PORT || 3011;
const dbConfig = require("./src/config/db.config.js");
const DATABASE_HOST = dbConfig.DB_HOST;
const DATABASE_PORT = dbConfig.DB_PORT;
const DATABASE_NAME = dbConfig.DB_NAME;
const DB_CONNECTOR = dbConfig.DB_CONNECTOR;
const CONNECTION_STRING = `${DB_CONNECTOR}://${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}`;

mongoose.set("strictQuery", false);
mongoose
  .connect(CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 50,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  console.log({ token });
  if (token) {
    jwt.verify(token, JWT_ACCESS_SECRET, async (err, user) => {
      if (err) {
        return next(new Error("Authentication error"));
      }
      console.log({ user });
      const userData = await User.findById(user.userId);
      if (!userData) {
        return next(new Error("User not found"));
      }
      socket.user = userData._id;
      next();
    });
  } else {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("New client connected", socket.user);

  socket.on("createGame", async () => {
    const time = Date.now();
    const id = md5(time);
    const chess = new ChessV2();

    const board = {
      game_id: id,
      player1: socket.user,
      player2: "",
      board: chess.board(),
      score: 0,
      turn_player: chess.turn(),
      move_number: chess.moveNumber(),
      fen: chess.fen(),
    };

    const insert = await Game.create(board);
    if (insert) {
      socket.join(board.game_id);
    }
  });

  socket.on("move", async function (move) {
    // console.log("7s200:move:2");
    const { from, to, turn, address, userid, isPromotion, fen, game_id } = move; //fake fen'
    socket.join(game_id);
    const board = await Game.findOne({ game_id: game_id });
    if (board.player1 === "" || board.player2 === "") {
      return;
    }
    // console.log("7s200:move:3", (socket as any).user, turn, game_id);
    if (board.isGameDraw || board.isGameOver) {
      return;
    }
    // console.log("7s200:move:4");
    const chess = new ChessV2(fen);
    try {
      console.log("7s200:move:promotion");
      if (!isPromotion) {
        chess.move({
          from: from,
          to: to,
          // promotion: "q",
        });
      }
    } catch (error) {
      console.log("7s200:move:err");
    }

    const isGameOver = chess.isGameOver();
    const isGameDraw = chess.isDraw();
    // console.log("7s200:move:5");

    const newBoard = {
      $set: {
        board: chess.board(),
        turn_player: chess.turn(),
        move_number: chess.moveNumber(),
        fen: chess.fen(),
        isGameDraw: isGameDraw,
        isGameOver: isGameOver,
      },
    };
    // console.log("7s200:move:6");
    io.to(game_id).emit("newmove", {
      game_id: game_id,
      from,
      to,
      board: chess.board(),
      turn: chess.turn(),
      fen: chess.fen(),
    });
    // console.log("7s200:move:7", { game_id: game_id, from, to, board: chess.board(), turn: chess.turn(), fen: chess.fen() });

    await Game.findOneAndUpdate({ game_id: board.game_id }, newBoard)
      .then((data) => {
        if (data) {
          // console.log("7s200:move:8");
          //  io.to(board.game_id).emit("newMove", { from, to, board: chess.board(), turn: chess.turn(), fen: chess.fen() });
        }
      })
      .catch((err) => {
        // console.log("7s200:err", err);
      });
  });

  socket.on("joinGame", async function (data) {
    const board = await Game.findOne({ game_id: data.game_id });

    if (board) {
      socket.join(board.game_id);

      if (board.player1 === "" && board.player2 === "") {
        const updateDoc = {
          $set: {
            player1: socket.user,
          },
        };
        await Game.findOneAndUpdate({ game_id: data.game_id }, updateDoc);
        socket.join(data.game_id);
      } else if (board.player1 !== "" && socket.user !== board.player1) {
        const updateDoc = {
          $set: {
            player2: socket.user,
          },
        };
        await Game.findOneAndUpdate({ game_id: data.game_id }, updateDoc);
        socket.join(data.game_id);
      } else if (board.player2 !== "" && socket.user !== board.player2) {
        const updateDoc = {
          $set: {
            player1: socket.user,
          },
        };
        await Game.findOneAndUpdate({ game_id: data.game_id }, updateDoc);
        socket.join(data.game_id);
      }

      if (board.player1 && board.player2) {
        io.to(board.game_id).emit("start", { start: true });
      }
    }
  });

  socket.on("tournament", async function (data) {
    // const board = await Tournament.find();
    // console.log("7s200:joinTournament:board", board);
    if (data.player1 && data.player2 && data.tournamnetIndex) {
      const board = await Tournament.findOne({
        player1: data.player1,
        player2: data.player2,
        tournamentIndex: data.tournamentIndex,
        game_id: `${data.player1}-${data.player2}-${data.tournamentIndex}`,
      });
      if (!board) {
        const chess = new ChessV2();
        const board = {
          board: chess.board(),
          fen: chess.fen(),
          player1: data.player1,
          player2: data.player2,
          turn_player: chess.turn(),
          game_id: `${data.player1}-${data.player2}-${data.tournamentIndex}`,
        };
        const newBoard = await Tournament.create(board);
        socket.join(`${data.player1}-${data.player2}-${data.tournamentIndex}`);
      }
    }
  });

  socket.on("jointournamentgame", async function (data) {
    socket.join(data.game_id);
  });

  socket.on("tournamentmove", async function (move) {
    const { from, to, turn, address, userid, isPromotion, fen, game_id } = move; //fake fen'
    socket.join(game_id);

    const board = await Tournament.findOne({ game_id: game_id });
    console.log("7s200:board", board);
    if (board.player1 === "" || board.player2 === "") {
      return;
    }
    if (board.isGameDraw || board.isGameOver) {
      return;
    }
    const chess = new ChessV2(fen);
    try {
      console.log("7s200:move:promotion");
      if (!isPromotion) {
        chess.move({
          from: from,
          to: to,
          // promotion: "q",
        });
      }
    } catch (error) {
      console.log("7s200:move:err");
    }
    const isGameOver = chess.isGameOver();
    const isGameDraw = chess.isDraw();
    const newBoard = {
      $set: {
        board: chess.board(),
        turn_player: chess.turn(),
        move_number: chess.moveNumber(),
        fen: chess.fen(),
        isGameDraw: isGameDraw,
        isGameOver: isGameOver,
      },
    };
    io.to(game_id).emit("tournamentnewmove", {
      game_id: game_id,
      from,
      to,
      board: chess.board(),
      turn: chess.turn(),
      fen: chess.fen(),
    });
    await Tournament.findOneAndUpdate({ game_id: board.game_id }, newBoard)
      .then((data) => {
        if (data) {
        }
      })
      .catch((err) => {});
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Socket.io server listening on http://localhost:${PORT}`);
});
