const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  DOB: { type: Date, required: true },
  contact: { type: String, required: true },
  salary: { type: Number, required: true },
  salaryDate: { type: Date }, // Add this field
  assignedClass: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null }, // Allow null
});

module.exports = mongoose.model('Teacher', teacherSchema);
