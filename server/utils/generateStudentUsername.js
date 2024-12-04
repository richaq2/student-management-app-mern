// utils/generateStudentUsername.js

const Student = require('../models/Student');

/**
 * Generates a unique username for a student in the format:
 * Name_DOB (e.g., johndoe_20010115)
 * @param {Object} student - The student object containing name and DOB.
 * @returns {String} - The generated username.
 */
const generateStudentUsername = async (student) => {
  if (!student.name || !student.DOB) {
    throw new Error('Student must have a name and date of birth to generate username.');
  }

  // Remove spaces and non-alphabetic characters from the name, and convert to lowercase
  const namePart = student.name.replace(/[^a-zA-Z]/g, '').toLowerCase();

  // Format DOB as YYYYMMDD
  const dob = new Date(student.DOB);
  const year = dob.getFullYear();
  const month = String(dob.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(dob.getDate()).padStart(2, '0');
  const dobPart = `${day}${month}${year}`;

  let baseUsername = `${namePart}_${dobPart}`;
  let username = baseUsername;
  let counter = 1;

  // Ensure the username is unique by appending a counter if necessary
  let existingUser = await Student.findOne({ username });
  while (existingUser) {
    username = `${baseUsername}_${counter}`;
    counter += 1;
    existingUser = await Student.findOne({ username });
  }

  return username;
};

module.exports = generateStudentUsername;
