const mongoose = require("mongoose");

const PasswordSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensures one password entry per username
  },
  plainPassword: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Timestamp of when the password was generated
  },
});

module.exports = mongoose.model("Password", PasswordSchema);
