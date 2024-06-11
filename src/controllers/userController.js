require("dotenv").config();
const db = require("../models");
const User = db.account;

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password"); // revome file password in result
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json(user);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.updateProfile = async (req, res) => {
  const { avatars, username } = req.body;
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    }

    if (username) {
      user.username = username;
    }
    if (avatars) {
      user.avatars = avatars;
    }

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

