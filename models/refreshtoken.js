import jwt from "jsonwebtoken";
import RefreshToken from "../models/RefreshToken.js";
import User from "../models/User.js";
import { createAccessToken } from "../utils/tokens.js";

export const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) return res.status(401).json({ error: "No token" });

  const stored = await RefreshToken.findOne({ token });
  if (!stored) return res.status(403).json({ error: "Invalid refresh" });

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

  const user = await User.findById(decoded.id);

  const newAccessToken = createAccessToken(user);

  res.json({ accessToken: newAccessToken });
};