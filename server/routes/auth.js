const express = require('express');
const router = express.Router();

// Simulated Users Database
const users = [
  { username: 'admin', password: '1234', role: 'admin' },
  { username: 'teacher', password: '1234', role: 'teacher' },
  { username: 'student', password: '1234', role: 'student' },
];

// Login Route
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && u.password === password);
  if (user) {
    res.json({ username: user.username, role: user.role });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Logout Route (Optional for session clearing)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
