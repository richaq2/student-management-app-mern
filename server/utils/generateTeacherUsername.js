// utils/generateTeacherUsername.js

const Teacher = require('../models/Teacher');

/**
 * Generates a unique username for a teacher in the format:
 * Name_DOB (e.g., janesmith_19800322)
 * @param {Object} teacher - The teacher object containing name and DOB.
 * @returns {String} - The generated username.
 */
const generateTeacherUsername = async (teacher) => {
  if (!teacher.name || !teacher.DOB) {
    throw new Error('Teacher must have a name and date of birth to generate username.');
  }

  // Remove spaces and non-alphabetic characters from the name, and convert to lowercase
  const namePart = teacher.name.replace(/[^a-zA-Z]/g, '').toLowerCase();

  // Format DOB as YYYYMMDD
  const dob = new Date(teacher.DOB);
  const year = dob.getFullYear();
  const month = String(dob.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(dob.getDate()).padStart(2, '0');
  const dobPart = `${year}${month}${day}`;

  let baseUsername = `${namePart}_${dobPart}`;
  let username = baseUsername;
  let counter = 1;

  // Ensure the username is unique by appending a counter if necessary
  let existingUser = await Teacher.findOne({ username });
  while (existingUser) {
    username = `${baseUsername}_${counter}`;
    counter += 1;
    existingUser = await Teacher.findOne({ username });
  }

  return username;
};

module.exports = generateTeacherUsername;
