const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const generateToken = require("../utils/generateToken");
const { comparePassword } = require("../utils/passwordUtils");
const { verifyToken } = require("../middleware/authMiddleware");

const admins = [{ username: "admin", password: "admin1234", role: "admin" }];

/**
 * @route POST /api/auth/login
 * @desc Authenticate a user (admin, student, teacher)
 * @access Public
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  try {
    const admin = admins.find(
      (u) => u.username === username && u.password === password
    );
    if (admin) {
      const token = generateToken({
        username: admin.username,
        role: admin.role,
      });
      return res.json({ username: admin.username, role: admin.role, token });
    }

    const student = await Student.findOne({ username });
    if (student) {
      const isMatch = await comparePassword(password, student.password);
      if (isMatch) {
        const token = generateToken({
          username: student.username,
          role: "student",
        });
        return res.json({ username: student.username, role: "student", token });
      }
    }

    const teacher = await Teacher.findOne({ username });
    if (teacher) {
      const isMatch = await comparePassword(password, teacher.password);
      if (isMatch) {
        const token = generateToken({
          username: teacher.username,
          role: "teacher",
        });
        return res.json({ username: teacher.username, role: "teacher", token });
      }
    }

    res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 * @route 
 * @desc 
 * @access 
 */
router.post("/logout", verifyToken, (req, res) => {
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
