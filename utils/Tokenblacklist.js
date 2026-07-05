const redis = require("./redis");

async function blacklistToken(token, exp) {
  const ttl = exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) {
    await redis.set(`bl_${token}`, "1", "EX", ttl);
  }
}

async function isBlacklisted(token) {
  const result = await redis.get(`bl_${token}`);
  return result === "1";
}

module.exports = { blacklistToken, isBlacklisted };