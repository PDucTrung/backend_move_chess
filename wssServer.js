require("dotenv").config();
const { WebSocketServer, WebSocket } = require("ws");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const db = require("./src/models");
const Room = db.room;

const PORT = process.env.WSS_PORT || 3010;
const wss = new WebSocketServer({ port: PORT });

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

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", async (message) => {
    const data = JSON.parse(message);
    console.log({ data });
    switch (data.type) {
      case "CREATE_ROOM":
        const roomId = uuidv4();
        const newRoom = new Room({
          roomId,
          users: [data.userId],
          streamData: null,
        });
        await newRoom.save();
        ws.roomId = roomId;
        ws.userId = data.userId;
        ws.send(JSON.stringify({ type: "ROOM_CREATED", roomId }));
        break;
      case "JOIN_ROOM":
        const room = await Room.findOne({ roomId: data.roomId });
        if (room) {
          room.users.push(data.userId);
          await room.save();
          ws.roomId = data.roomId;
          ws.userId = data.userId;
          ws.send(JSON.stringify({ type: "ROOM_JOINED", roomId: data.roomId }));
        } else {
          ws.send(JSON.stringify({ type: "ERROR", message: "Room not found" }));
        }
        break;
      case "OFFER":
      case "ANSWER":
      case "ICE_CANDIDATE":
      case "STOP_SHARING":
        wss.clients.forEach((client) => {
          if (client.roomId === ws.roomId && client.userId !== ws.userId && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
        break;
    }
  });

  ws.on("close", async () => {
    console.log("Client disconnected");
    if (ws.roomId) {
      const room = await Room.findOne({ roomId: ws.roomId });
      if (room) {
        room.users = room.users.filter((userId) => userId !== ws.userId);
        await room.save();
      }
    }
  });
});

wss.on("listening", () => {
  console.log(`WebSocket server listening on ws://localhost:${PORT}`);
});
