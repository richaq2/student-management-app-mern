const Teacher = require("../models/Teacher");

/**
 * @param {Object} teacher - The teacher object containing name and DOB.
 * @returns {String} - The generated username.
 */
const generateTeacherUsername = async (teacher) => {
  if (!teacher.name || !teacher.DOB) {
    throw new Error(
      "Teacher must have a name and date of birth to generate username."
    );
  }

  const firstName = teacher.name
    .split(" ")[0]
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  const dob = new Date(teacher.DOB);
  const year = dob.getFullYear();

  let baseUsername = `${firstName}_${year}`;
  let username = baseUsername;
  let counter = 1;

  let existingUser = await Teacher.findOne({ username });
  while (existingUser) {
    username = `${baseUsername}_${counter}`;
    counter += 1;
    existingUser = await Teacher.findOne({ username });
  }

  return username;
};

module.exports = generateTeacherUsername;
