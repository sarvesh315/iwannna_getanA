import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import wellnessRoutes from "./routes/wellness.routes.js";

dotenv.config();

const app = express();

/* ---------------- SECURITY ---------------- */
app.use(helmet());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

/* ---------------- CORE ---------------- */
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

/* ---------------- DB ---------------- */
connectDB();

/* ---------------- ROUTES ---------------- */
app.use("/api/auth", authRoutes);
app.use("/api/wellness", wellnessRoutes);

/* ---------------- HEALTH CHECK ---------------- */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

/* ---------------- START ---------------- */
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});