// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token and attach user to request.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ message: 'Access token missing' });

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid access token' });
    req.user = user; // Attach user info to request
    next();
  });
};

/**
 * Middleware to check if the user is an admin.
 */
const verifyAdmin = (req, res, next) => {
  if (req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};

/**
 * Middleware to check if the user is a teacher.
 */
const verifyTeacher = (req, res, next) => {
  if (req.user.role === 'teacher') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Teachers only.' });
  }
};

/**
 * Middleware to check if the user is a student.
 */
const verifyStudent = (req, res, next) => {
  if (req.user.role === 'student') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Students only.' });
  }
};

module.exports = { verifyToken, verifyAdmin, verifyTeacher, verifyStudent };
