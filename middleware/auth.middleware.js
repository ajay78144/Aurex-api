const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Not Authorized - No token provided',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach full user info from token payload
    req.user = {
      id: decoded.id || decoded._id,
      role: decoded.role || 'customer',
      email: decoded.email || '',
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired - please refresh your token',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid Token',
    });
  }
};

module.exports = protect;