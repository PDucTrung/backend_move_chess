require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const db = require("../models");
const User = db.account;
const Token = db.token;
const { sendEmail } = require("../utils/emailService");
const {
  validatePassword,
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/utils");

const jwtConfig = require("../config/jwt.config");
const API_BASE_URL = process.env.API_BASE_URL;
const JWT_ACCESS_SECRET = jwtConfig.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = jwtConfig.JWT_REFRESH_SECRET;
const EMAIL_SECRET = jwtConfig.EMAIL_SECRET;

exports.register = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    if (!validatePassword(password)) {
      return res
        .status(400)
        .send(
          "Password must be 6-50 characters long and include at least one number, one uppercase letter, one lowercase letter, and one special character"
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      username: "user" + new Date().getTime(),
    });
    await user.save();

    const token = jwt.sign({ userId: user._id }, EMAIL_SECRET, {
      expiresIn: "5m",
    });
    const url = `${API_BASE_URL}/api/auth/confirmation/${token}`;

    await sendEmail(
      email,
      "Email Confirmation",
      `<a href="${url}">Click here to confirm your email</a>`
    );

    const userInfo = await User.findById(user._id).select("-password");
    res.status(200).send({
      user: userInfo,
      msg: "User registered! Please check your email to confirm your account.",
    });
  } catch (err) {
    res.status(400).send("Error registering user");
  }
};

exports.resendEmail = async (req, res) => {
  try {
    const { userId, email } = req.body;
    if (!userId || !email)
      res
        .status(400)
        .send({ status: "Failed", msg: "Invalid email or userId" });
    const token = jwt.sign({ userId: userId }, EMAIL_SECRET, {
      expiresIn: "5m",
    });
    const url = `${API_BASE_URL}/api/auth/confirmation/${token}`;

    await sendEmail(
      email,
      "Email Confirmation",
      `<a href="${url}">Click here to confirm your email</a>`
    );
    res.status(200).send({
      msg: "Resending email Success!",
    });
  } catch (err) {
    res.status(400).send("Error resending email");
  }
};

exports.confirmEmail = async (req, res) => {
  try {
    const { userId } = jwt.verify(req.params.token, EMAIL_SECRET);
    await User.updateOne({ _id: userId }, { isVerified: true });
    // res.status(200).send("Email confirmed!");
    res.redirect(`${process.env.REDIRECT_URL}/signup/step2`);
  } catch (err) {
    res.status(400).send("Invalid token");
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    const check = await bcrypt.compare(password, user.password);
    if (!user || !check) {
      return res.status(400).send("Invalid email or password");
    }
    if (!user.isVerified) {
      return res.status(400).send("Please verify your email first");
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token in database
    await new Token({ userId: user._id, token: refreshToken }).save();

    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
    res.status(200).json({
      accessToken,
      twoFactorAuthEnabled: user.arbitration.twoFactorAuthEnabled,
    });
  } catch (err) {
    res.status(400).send("Error logging in");
  }
};

exports.callback = async (req, res) => {
  if (!req.user) {
    res.status(400).json({ error: "Authentication failed" });
  }
  const accessToken = generateAccessToken(req.user._id);
  const refreshToken = generateRefreshToken(req.user._id);

  await new Token({ userId: req.user._id, token: refreshToken }).save();

  res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
  // res.status(200).json({ accessToken });
  res.redirect(`${process.env.API_BASE_URL}`);
};

exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).send("No refresh token");
  }

  try {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const tokenDoc = await Token.findOne({ token: refreshToken });
    if (!tokenDoc) {
      return res.status(401).send("Invalid refresh token");
    }

    const accessToken = generateAccessToken(payload.userId);
    res.status(200).json({ accessToken });
  } catch (err) {
    res.status(401).send("Invalid refresh token");
  }
};

exports.logout = async (req, res, next) => {
  // req.logout((err) => {
  //   if (err) {
  //     return res.status(500).json({ message: 'Failed to logout', err });
  //   }
  // });
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await Token.findOneAndDelete({ token: refreshToken });
    res.clearCookie("refreshToken");
  }
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to destroy session" });
    }
  });
  res.status(200).send("Logged out");
};

exports.forgotPassword = async (req, res) => {
  const { email, redirectUrl } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("User with this email does not exist");
    }

    const token = jwt.sign({ userId: user._id }, JWT_ACCESS_SECRET, {
      expiresIn: "1h",
    });
    const url = `${redirectUrl || API_BASE_URL}/reset-password/${token}`;
    await sendEmail(
      email,
      "Password Reset",
      `<a href="${url}">Click here to reset your password</a>`
    );

    res.status(200).send("Password reset email sent");
  } catch (err) {
    res.status(400).send("Error sending email");
  }
};

exports.resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  try {
    const { userId } = jwt.verify(req.params.token, JWT_ACCESS_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ _id: userId }, { password: hashedPassword });
    res.status(200).send("Password reset successfully");
  } catch (err) {
    res.status(400).send("Invalid token");
  }
};

exports.enable2FA = async (req, res) => {
  const user = await User.findById(req.user.userId);

  const secret = speakeasy.generateSecret({ length: 20 });
  user.arbitration.twoFactorSecret = secret.base32;
  user.arbitration.twoFactorAuthEnabled = true;
  await user.save();

  const otpAuthUrl = speakeasy.otpauthURL({
    secret: user.arbitration.twoFactorSecret,
    label: user.username,
    issuer: process.env.APP_NAME,
  });

  QRCode.toDataURL(otpAuthUrl, (err, dataUrl) => {
    if (err) {
      return res.status(500).send("Error generating QR code");
    }
    res.json({ qrCodeUrl: dataUrl });
  });
};

exports.disable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user.twoFactorEnabled) {
      return res.status(400).send("2FA is not enabled");
    }

    user.arbitration.twoFactorAuthEnabled = false;
    user.arbitration.twoFactorSecret = null;
    await user.save();

    res.send("2FA disabled successfully");
  } catch (error) {
    res.status(500).send("Server error");
  }
};

exports.verify2FA = async (req, res) => {
  const { otp } = req.body;
  const user = await User.findById(req.user.userId);

  const verified = speakeasy.totp.verify({
    secret: user.arbitration.twoFactorSecret,
    encoding: "base32",
    token: otp,
  });

  if (!verified) {
    return res.status(401).send("Invalid OTP");
  }

  const authToken = jwt.sign(
    { userId: user._id, twoFactorVerified: true },
    JWT_ACCESS_SECRET,
    { expiresIn: "1h" }
  );
  res.json({ authToken });
};
