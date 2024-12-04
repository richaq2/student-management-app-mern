const Student = require("../models/Student");

/**
 * @param {Object} student - The student object containing name and DOB.
 * @returns {String} - The generated username.
 */
const generateStudentUsername = async (student) => {
  if (!student.name || !student.DOB) {
    throw new Error(
      "Student must have a name and date of birth to generate username."
    );
  }

  const firstName = student.name
    .split(" ")[0]
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  // Extract year from DOB
  const dob = new Date(student.DOB);
  const year = dob.getFullYear();

  let baseUsername = `${firstName}_${year}`;
  let username = baseUsername;
  let counter = 1;

  let existingUser = await Student.findOne({ username });
  while (existingUser) {
    username = `${baseUsername}_${counter}`;
    counter += 1;
    existingUser = await Student.findOne({ username });
  }

  return username;
};

module.exports = generateStudentUsername;
