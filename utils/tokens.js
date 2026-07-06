import jwt from "jsonwebtoken";

export function generateAccessToken(user) {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "15m" });
}

export function generateRefreshToken(user) {
  return jwt.sign(user, process.env.REFRESH_SECRET, { expiresIn: "7d" });
}