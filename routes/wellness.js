import express from "express";
import { readDB, writeDB } from "../utils/db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/* -----------------------
   AUTH MIDDLEWARE
------------------------ */
router.use(authenticateToken);

/* -----------------------
   MOOD ROUTES
------------------------ */
router.get("/mood", (req, res) => {
  const db = readDB();

  const entries = db.moods
    .filter((m) => m.userId === req.user.sub)
    .sort((a, b) => new Date(b.time) - new Date(a.time));

  res.json({ entries });
});

router.post("/mood", (req, res) => {
  const { emoji } = req.body;

  if (!emoji) {
    return res.status(400).json({ error: "Missing mood emoji." });
  }

  const db = readDB();

  const entry = {
    id: String(Date.now()),
    userId: req.user.sub,
    emoji,
    time: new Date().toISOString(),
  };

  db.moods.push(entry);
  writeDB(db);

  res.status(201).json({ entry });
});

/* -----------------------
   JOURNAL ROUTES
------------------------ */
router.get("/journal", (req, res) => {
  const db = readDB();

  const entries = db.journal
    .filter((j) => j.userId === req.user.sub)
    .sort((a, b) => new Date(b.time) - new Date(a.time));

  res.json({ entries });
});

router.post("/journal", (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Journal entry can't be empty." });
  }

  const db = readDB();

  const entry = {
    id: String(Date.now()),
    userId: req.user.sub,
    text: text.trim(),
    time: new Date().toISOString(),
  };

  db.journal.push(entry);
  writeDB(db);

  res.status(201).json({ entry });
});

export default router;
