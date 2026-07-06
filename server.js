import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.routes.js";
import wellnessRoutes from "./routes/wellness.routes.js";

console.log("MONGO_URI:", process.env.MONGO_URI);

const app = express();

app.use(express.json());

try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected");
} catch (err) {
  console.error("MongoDB connection error:", err);
  process.exit(1);
}

app.use("/api/auth", authRoutes);
app.use("/api/wellness", wellnessRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});