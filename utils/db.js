import fs from "fs";

const DB_FILE = "./data.json";

export const readDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], moods: [], journal: [], verifications: [] }, null, 2));
  }

  const data = fs.readFileSync(DB_FILE, "utf-8");
  return JSON.parse(data);
};

export const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};