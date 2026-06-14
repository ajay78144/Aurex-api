const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// Register User
const registerUser = async (req, res) => {
  try {

    const {
      name,
      email,
      password,
      privacyAccepted,
      termsAccepted
    } = req.body;

    if (!privacyAccepted || !termsAccepted) {
      return res.status(400).json({
        message: "Please accept Terms & Privacy Policy"
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      privacyAccepted,
      termsAccepted,
      acceptedAt: new Date()
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      privacyAccepted: user.privacyAccepted,
      termsAccepted: user.termsAccepted,
      token: generateToken(user._id)
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

// Login User
const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (
      user &&
      await bcrypt.compare(password, user.password)
    ) {

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        privacyAccepted: user.privacyAccepted,
        termsAccepted: user.termsAccepted,
        token: generateToken(user._id)
      });

    }

    res.status(401).json({
      message: "Invalid Credentials"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

module.exports = {
  registerUser,
  loginUser
};