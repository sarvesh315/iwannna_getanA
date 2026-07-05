import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: String,
    email: { type: String, unique: true },
    passwordHash: String,

    provider: { type: String, default: "local" },
    googleId: String,

    verified: { type: Boolean, default: false },

    twoFactor: {
      enabled: { type: Boolean, default: false },
      secret: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);