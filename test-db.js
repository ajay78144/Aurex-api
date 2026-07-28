require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("./utils/generateToken");

async function test() {
  console.log("Starting test-db...");
  try {
    console.log("Connecting to DB:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connected successfully!");

    const testEmail = "test_" + Date.now() + "@example.com";
    
    // Test bcrypt hashing
    console.log("Testing bcrypt hashing...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    console.log("Bcrypt hashed password:", hashedPassword);

    // Test creating user
    console.log("Creating user with email:", testEmail);
    const user = await User.create({
      name: "Test User",
      email: testEmail,
      password: hashedPassword,
      privacyAccepted: true,
      termsAccepted: true,
      acceptedAt: new Date()
    });
    console.log("User created successfully:", user);

    // Test password compare
    console.log("Testing bcrypt compare...");
    const isMatch = await bcrypt.compare("password123", user.password);
    console.log("Password match result:", isMatch);

    // Test token generation
    console.log("Testing token generation...");
    const token = generateToken(user._id);
    console.log("Generated token:", token);

    // Cleanup
    console.log("Cleaning up test user...");
    await User.findByIdAndDelete(user._id);
    console.log("Cleanup done!");

  } catch (error) {
    console.error("Test failed with error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("DB Disconnected.");
  }
}

test();
