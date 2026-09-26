const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const generateToken = require('../utils/generateToken');
const {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendForgotPasswordEmail,
  sendPasswordChangedEmail,
} = require('../utils/email');

// Helper to generate refresh token
const generateRefreshToken = (id, role, email) => {
  return jwt.sign(
    { id, role, email },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

// Helper to generate access token
const generateAccessToken = (id, role, email) => {
  return jwt.sign(
    { id, role, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

// Register User
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      privacyAccepted,
      termsAccepted,
    } = req.body;

    if (!privacyAccepted || !termsAccepted) {
      return res.status(400).json({
        success: false,
        message: 'Please accept Terms & Privacy Policy',
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      privacyAccepted,
      termsAccepted,
      acceptedAt: new Date(),
      emailVerificationToken,
      emailVerificationExpires,
    });

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id, user.role, user.email);

    // Save refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Send welcome + verification email (don't await to speed up response)
    try {
      await sendWelcomeEmail(user);
      await sendVerificationEmail(user, emailVerificationToken);
    } catch (emailErr) {
      console.error('Email error:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token: accessToken,
        refreshToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          privacyAccepted: user.privacyAccepted,
          termsAccepted: user.termsAccepted,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Credentials',
      });
    }

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id, user.role, user.email);

    // Keep only last 5 refresh tokens (multi-device support)
    user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: accessToken,
        refreshToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          privacyAccepted: user.privacyAccepted,
          termsAccepted: user.termsAccepted,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshTokens -emailVerificationToken -resetPasswordToken');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.avatar = req.body.avatar || user.avatar;

    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 12);
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated',
      data: {
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          avatar: updatedUser.avatar,
          isEmailVerified: updatedUser.isEmailVerified,
          privacyAccepted: updatedUser.privacyAccepted,
          termsAccepted: updatedUser.termsAccepted,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Refresh Token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh'
      );
    } catch (err) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens.includes(token)) {
      return res.status(403).json({ success: false, message: 'Refresh token not valid' });
    }

    const newAccessToken = generateAccessToken(user._id, user.role, user.email);
    const newRefreshToken = generateRefreshToken(user._id, user.role, user.email);

    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter(t => t !== token);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    try {
      await sendPasswordChangedEmail(user);
    } catch (e) {
      console.error('Email error:', e.message);
    }

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Resend Verification Email
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    try {
      await sendVerificationEmail(user, emailVerificationToken);
    } catch (e) {
      console.error('Email error:', e.message);
    }

    res.json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    try {
      await sendForgotPasswordEmail(user, resetToken);
    } catch (e) {
      console.error('Email error:', e.message);
    }

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    const user = await User.findById(req.user.id);

    if (user && token) {
      user.refreshTokens = user.refreshTokens.filter(t => t !== token);
      await user.save();
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  refreshToken,
  changePassword,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  logout,
};