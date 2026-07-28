require("dotenv").config();
const crypto = require("crypto");
console.log("Starting crypto test...");
try {
  const buf = crypto.randomBytes(16);
  console.log("Random bytes generated:", buf.toString("hex"));
} catch (err) {
  console.error("Crypto error:", err);
}
console.log("Crypto test completed.");
