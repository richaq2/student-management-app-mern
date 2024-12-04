const bcrypt = require("bcrypt");

/**
 * @param {String} name - Full name of the user.
 * @param {Date} DOB - Date of birth of the user.
 * @returns {String} - The generated password.
 */
const generatePassword = (name, DOB) => {
  const namePart = name.substring(0, 3).toLowerCase();
  const yearPart = DOB.getFullYear().toString().slice(-2);
  const password = `${namePart}${yearPart}`;
  return password;
};

/**
 * @param {String} password - The plain text password.
 * @returns {String} - The hashed password.
 */
const hashPassword = async (password) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

/**
 * @param {String} password - The plain text password.
 * @param {String} hashedPassword - The hashed password.
 * @returns {Boolean} - True if passwords match, else false.
 */
const comparePassword = async (password, hashedPassword) => {
  const match = await bcrypt.compare(password, hashedPassword);
  return match;
};

module.exports = { generatePassword, hashPassword, comparePassword };
