const jwt = require('jsonwebtoken');

// Access token (short-lived, used as main token for backward compat)
const generateToken = (id, role, email) => {
  return jwt.sign(
    { id, role: role || 'customer', email: email || '' },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    }
  );
};

module.exports = generateToken;