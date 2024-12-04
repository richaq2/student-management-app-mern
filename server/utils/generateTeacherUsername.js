// utils/generateTeacherUsername.js
const Teacher = require('../models/Teacher');

/**
 * Generates a unique username for a teacher in the format:
 * Teacher_SequentialNumber (e.g., Teacher_001)
 * @returns {String} - The generated username.
 */
const generateTeacherUsername = async () => {
  // Count existing teachers to get the next number
  const count = await Teacher.countDocuments({});

  // Format sequential number with leading zeros (e.g., 001)
  const sequentialNumber = String(count + 1).padStart(3, '0');

  const username = `Teacher_${sequentialNumber}`;

  return username;
};

module.exports = generateTeacherUsername;
