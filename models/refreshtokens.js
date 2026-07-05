import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: String,
    token: String,
    expiresAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("RefreshToken", refreshTokenSchema);