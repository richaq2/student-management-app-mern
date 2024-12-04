// utils/generateStudentUsername.js
const Student = require('../models/Student');
const Class = require('../models/Class');

/**
 * Generates a unique username for a student in the format:
 * Year_ClassName_SequentialNumber (e.g., 2023_MATH101_001)
 * @param {Object} student - The student object containing class reference.
 * @returns {String} - The generated username.
 */
const generateStudentUsername = async (student) => {
  if (!student.class) {
    throw new Error('Student must be assigned to a class to generate username.');
  }

  // Fetch class details
  const classData = await Class.findById(student.class);
  if (!classData) {
    throw new Error('Class not found for the student.');
  }

  const year = classData.year;
  const classname = classData.name.replace(/\s+/g, '').toUpperCase(); // Remove spaces and uppercase

  // Count existing students in the class to get the next number
  const count = await Student.countDocuments({ class: student.class });

  // Format sequential number with leading zeros (e.g., 001)
  const sequentialNumber = String(count + 1).padStart(3, '0');

  const username = `${year}_${classname}_${sequentialNumber}`;

  return username;
};

module.exports = generateStudentUsername;
