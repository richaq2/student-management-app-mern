// models/Teacher.js
const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  DOB: { type: Date, required: true },
  contact: { type: String, required: true },
  salary: { type: Number, required: true },
  salaryDate: { type: Date }, // Existing field
  assignedClass: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null }, // Existing field
  username: { type: String, unique: true }, // New field
  password: { type: String }, // New field
});

module.exports = mongoose.model('Teacher', teacherSchema);
