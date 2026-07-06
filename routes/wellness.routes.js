import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/mood", (req, res) => {
  res.json({ mood: "ok" });
});

router.post("/mood", (req, res) => {
  res.json({ saved: true });
});

router.get("/journal", (req, res) => {
  res.json({ entries: [] });
});

router.post("/journal", (req, res) => {
  res.json({ saved: true });
});

export default router;
