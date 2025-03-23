// utils/jwtGenerator.js
const jwt = require('jsonwebtoken');

function generateJWT(userId, role) {
  const payload = {
    user: {
      id: userId,
      role: role
    }
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
}

module.exports = generateJWT;