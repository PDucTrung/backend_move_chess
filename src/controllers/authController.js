require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.account;
const Token = db.token;
const { sendEmail } = require("../utils/emailService");
const { validatePassword } = require("../utils/utils");

const jwtConfig = require("../config/jwt.config");
const API_BASE_URL = process.env.API_BASE_URL;
const JWT_ACCESS_SECRET = jwtConfig.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = jwtConfig.JWT_REFRESH_SECRET;
const EMAIL_SECRET = jwtConfig.EMAIL_SECRET;

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, JWT_ACCESS_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (userId) => {
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
  return refreshToken;
};

exports.register = async (req, res) => {
  const { email, username, password } = req.body;
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
    const user = new User({ email, username, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, EMAIL_SECRET, {
      expiresIn: "1d",
    });
    const url = `${API_BASE_URL}/api/auth/confirmation/${token}`;

    await sendEmail(
      email,
      "Email Confirmation",
      `<a href="${url}">Click here to confirm your email</a>`
    );

    res
      .status(201)
      .send(
        "User registered! Please check your email to confirm your account."
      );
  } catch (err) {
    res.status(400).send("Error registering user");
  }
};

exports.confirmEmail = async (req, res) => {
  try {
    const { userId } = jwt.verify(req.params.token, EMAIL_SECRET);
    await User.updateOne({ _id: userId }, { isVerified: true });
    res.status(200).send("Email confirmed!");
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
    res.status(200).json({ accessToken });
  } catch (err) {
    res.status(400).send("Error logging in");
  }
};

exports.loginGoogle = async (req, res) => {
  // Check if the user is authenticated
  const isLogin = req.oidc.isAuthenticated();
  if (!isLogin) {
    // Redirect to Google login
    res.oidc.login({
      authorizationParams: {
        connection: "google-oauth2",
      },
    });
  }

  // try {
  //   // Extract user information after successful authentication
  //   const { email, sub } = req.oidc.user;
  //   let user = await User.findOne({ email });

  //   if (!user) {
  //     // If user doesn't exist, create a new one
  //     user = new User({
  //       email,
  //       username: email.split("@")[0],
  //       oauthProviders: [
  //         {
  //           provider: "google",
  //           providerId: sub,
  //         },
  //       ],
  //     });
  //     await user.save();
  //   } else {
  //     // Update user's oauthProviders if google not already added
  //     const googleProvider = user.oauthProviders.find(
  //       (provider) => provider.provider === "google"
  //     );
  //     if (!googleProvider) {
  //       user.oauthProviders.push({ provider: "google", providerId: sub });
  //       await user.save();
  //     }
  //   }

  //   // if (!user.isVerified) {
  //   //   return res.status(400).send("Please verify your email first");
  //   // }
  //   if (!user.isVerified) {
  //     user.isVerified = true; // Automatically verify the user if logging in with Google
  //     await user.save();
  //   }

  //   const accessToken = generateAccessToken(user._id);
  //   const refreshToken = generateRefreshToken(user._id);

  //   await new Token({ userId: user._id, token: refreshToken }).save();

  //   res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
  //   res.status(200).json({ accessToken });
  // } catch (err) {
  //   res.status(400).send("Error logging in with Google");
  // }
};

exports.loginFacebook = async (req, res) => {
  const isLogin = req.oidc.isAuthenticated();
  if (!isLogin)
    res.oidc.login({
      authorizationParams: {
        connection: "facebook",
      },
    });
  // const data = JSON.stringify(req.oidc.user);
  // console.log({ data });
  // res.send(data);
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

exports.logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await Token.findOneAndDelete({ token: refreshToken });
    res.clearCookie("refreshToken");
  }
  res.oidc.logout();
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

