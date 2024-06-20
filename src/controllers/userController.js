require("dotenv").config();
const db = require("../models");
const { ROLES_ACCOUNT } = require("../utils/contants");
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
    await user.save();

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

exports.addRole = async (req, res) => {
  const { role } = req.body;

  if (!ROLES_ACCOUNT.includes(role)) {
    return res.status(400).send("Invalid role");
  }

  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (!user.roles.includes(role)) {
      user.roles.push(role);
      await user.save();
    }

    res.send("Role added successfully");
  } catch (error) {
    console.error('Error adding role:', error);
    res.status(500).send("Server error");
  }
};

exports.removeRole = async (req, res) => {
  const { role } = req.body;

  if (!ROLES_ACCOUNT.includes(role)) {
    return res.status(400).send("Invalid role");
  }

  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    user.roles = user.roles.filter(r => r !== role);
    await user.save();

    res.send("Role removed successfully");
  } catch (error) {
    console.error('Error removing role:', error);
    res.status(500).send("Server error");
  }
};
