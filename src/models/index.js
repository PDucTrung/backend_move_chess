const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.account = require("./account.model");
db.game = require("./game.model");
db.skin = require("./skin.model");
db.token = require("./token.model");
db.bannedPlayer = require("./bannedPlayer.model");
db.room = require("./room.model");

module.exports = db;
