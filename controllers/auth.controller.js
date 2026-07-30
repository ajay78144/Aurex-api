const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// Register User
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
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
      phone,
      password: hashedPassword,
      privacyAccepted,
      termsAccepted,
      acceptedAt: new Date()
    });

    res.status(201).json({
      message: "User registered successfully",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        privacyAccepted: user.privacyAccepted,
        termsAccepted: user.termsAccepted
      }
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
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          privacyAccepted: user.privacyAccepted,
          termsAccepted: user.termsAccepted
        }
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

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        privacyAccepted: user.privacyAccepted,
        termsAccepted: user.termsAccepted
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;

    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await user.save();

    res.json({
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        privacyAccepted: updatedUser.privacyAccepted,
        termsAccepted: updatedUser.termsAccepted
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
};