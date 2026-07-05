// Run with: npm run seed
// Creates a demo account (student / wellness123) so you can log in
// immediately without signing up first.

const bcrypt = require("bcryptjs");
const { readDB, writeDB } = require("../utils/db");

(async () => {
  const db = readDB();

  if (db.users.find((u) => u.username === "student")) {
    console.log('Demo user "student" already exists — nothing to do.');
    return;
  }

  const passwordHash = await bcrypt.hash("wellness123", 10);
  db.users.push({
    id: String(Date.now()),
    name: "Alex",
    username: "student",
    email: null,
    passwordHash,
    provider: "local",
    createdAt: new Date().toISOString(),
  });
  writeDB(db);
  console.log('Demo user created: username "student", password "wellness123"');
})();
