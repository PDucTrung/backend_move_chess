const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  roomId: { type: String },
  users: [{ type: String, default: [] }],
  streamData: [{ type: Object, default: [] }],
});

module.exports = mongoose.model("Room", RoomSchema);
