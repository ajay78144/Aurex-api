const bcrypt = require("bcryptjs");
console.log("Starting bcrypt test...");
console.log("Hashing password...");
try {
  const hash = bcrypt.hashSync("password123", 10);
  console.log("Hash Sync successful:", hash);
  const match = bcrypt.compareSync("password123", hash);
  console.log("Compare Sync successful:", match);
} catch (e) {
  console.error("Error in sync bcrypt:", e);
}

bcrypt.hash("password123", 10, (err, hash) => {
  if (err) {
    console.error("Error in async bcrypt:", err);
  } else {
    console.log("Hash Async successful:", hash);
  }
});
