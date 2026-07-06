import express from "express";
import bcrypt from "bcryptjs";
import { readDB, writeDB } from "../utils/db.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokens.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const db = readDB();
    const user = db.users.find((u) => u.email === email);

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    db.refreshTokens.push({
      token: refreshToken,
      userId: user.id,
    });

    writeDB(db);

    res.json({
      token: accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;