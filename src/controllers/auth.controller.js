import { ENV } from "../config/env.js";
import db from "../config/db.js";
import UserModel from "../models/user.model.js";
import { signAccess, signRefresh } from "../utils/jwt.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { verifyToken } from "../utils/jwt.js";

const AuthController = {
  register: async (req, res) => {
    const {
      username,
      email,
      password,
      role = role || "customer",
      region = "asia",
      clearance = "low",
    } = req.body;

    if (!username || !email || !password)
      return res
        .status(400)
        .json({ error: "username,email,password required" });

    // validation input
    if (typeof username !== "string" || username.length < 3)
      return res.status(400).json({ error: "Invalid username" });

    if (typeof password !== "string" || password.length < 5)
      return res.status(400).json({ error: "Invalid password" });

    if (UserModel.findByUsername(username) || UserModel.findByEmail(email))
      return res.status(409).json({ error: "User exists" });

    const hash = await hashPassword(password);

    const user = {
      id: Date.now(),
      username,
      email,
      passwordHash: hash,
      role,
      attributes: { region, clearance },
    };

    UserModel.create(user);

    res.status(201).json({
      message: "User registered",
      user: { id: user.id, username: user.username, role: user.role },
    });
  },

  login: async (req, res) => {
    const { username, password } = req.body;

    // basic validation
    if (!username || !password)
      return res.status(400).json({ error: "username and password required" });

    // validation input
    if (typeof username !== "string" || username.length < 3)
      return res.status(400).json({ error: "Invalid username" });

    if (typeof password !== "string" || password.length < 5)
      return res.status(400).json({ error: "Invalid password" });

    const user = UserModel.findByUsername(username);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await comparePassword(password, user.passwordHash || "");

    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    // generate tokens
    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);

    // if refresh token already exists, remove it
    db.refreshTokens = db.refreshTokens.filter((rt) => rt.userId !== user.id);

    // store refresh token
    db.refreshTokens.push({
      token: refreshToken,
      userId: user.id,
      username: user.username,
      createdAt: Date.now(),
    });

    res.json({
      user,
      accessToken,
      expiresIn: ENV.ACCESS_EXPIRES_IN,
      // refreshToken,
    });
  },

  //   googleCallback: async (req, res) => {
  //     try {
  //       const { id, username, emails } = req.user;

  //       // Misal: cari user di database berdasarkan Google ID atau email
  //       const user = await UserModel.findOrCreateUser({
  //         googleId: id,
  //         username: username,
  //         email: emails[0].value,
  //       });

  //       //   const token = generateFakeTokenForUser(user);

  //       // Simpan ke cookie dan session seperti login biasa
  //       //   res.cookie("token", token, { httpOnly: true });

  //       req.session.user = {
  //         id: user.id,
  //         username: user.username,
  //         role: user.role || "user",
  //         token: "belum ada token",
  //       };

  //       return res.redirect("/dashboard");
  //     } catch (err) {
  //       console.error("Google login error:", err);
  //       return res.render("auth/login-failed", {
  //         title: "Login Gagal",
  //         error: "Login dengan Google gagal.",
  //       });
  //     }
  //   },

  verify: (req, res) => {
    // if token is valid, req.user is set by middleware
    if (!req.user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    res.status(200).json({ message: "Token is valid", user: req.user });
  },

  // refresh: (req, res) => {
  //   // get refresh token from db
  //   const tokens = db.refreshTokens;

  //   if (tokens.length === 0) {
  //     return res.status(400).json({ error: "No refresh tokens in database" });
  //   }

  //   const usernameToFind = req.user.username;

  //   const refreshToken = tokens.find((t) => t.username === usernameToFind);

  //   if (!refreshToken) {
  //     return res.status(403).json({ error: "Refresh token not found" });
  //   }

  //   res.json({ refreshToken: refreshToken.token });
  // },

  access: (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken)
      return res.status(400).json({ error: "refreshToken required" });

    const stored = db.refreshTokens.find((rt) => rt.token === refreshToken);

    if (!stored)
      return res.status(403).json({ error: "Invalid refresh token" });

    try {
      const decoded = verifyToken(refreshToken, true);
      const user = UserModel.findById(decoded.id);

      if (!user) return res.status(403).json({ error: "User not found" });

      // issue new access token
      const accessToken = signAccess(user);
      res.json({ accessToken });
    } catch (err) {
      // remove if invalid/expired
      db.refreshTokens = db.refreshTokens.filter(
        (rt) => rt.token !== refreshToken
      );

      // log the user out
      return res
        .status(403)
        .json({ error: "Invalid or expired refresh token" });
    }
  },

  logout: (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "refreshToken required" });
    }

    const before = db.refreshTokens.length;

    db.refreshTokens = db.refreshTokens.filter(
      (rt) => rt.token !== refreshToken
    );

    const after = db.refreshTokens.length;

    if (before === after) {
      return res
        .status(404)
        .json({ error: "Token not found or already logged out" });
    }

    return res.json({ message: "Logged out successfully" });
  },
};

export default AuthController;
