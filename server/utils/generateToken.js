// utils/generateToken.js
const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token for a user.
 * @param {Object} user - The user object containing username and role.
 * @returns {String} - The JWT token.
 */
const generateToken = (user) => {
  const payload = {
    username: user.username,
    role: user.role,
  };
  const secret = process.env.JWT_SECRET || 'your_jwt_secret'; // Use environment variable in production
  const options = { expiresIn: '1h' };
  return jwt.sign(payload, secret, options);
};

module.exports = generateToken;
