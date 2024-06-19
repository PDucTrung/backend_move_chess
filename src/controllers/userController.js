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
    const updates = {};
    if (username) {
      updates.username = username;
    }
    if (avatars && Array.isArray(avatars)) {
      updates.avatars = avatars;
    }
    user.save();

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, select: "-password" }
    );

    res.status(200).json({ user: updatedUser });
  } catch (err) {
    res.status(500).send("Server error");
  }
};
