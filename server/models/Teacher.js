const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female"], required: true },
  DOB: { type: Date, required: true },
  contact: { type: String, required: true },
  salary: { type: Number, required: true },
  salaryDate: { type: Date },
  assignedClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    default: null,
  },
  username: { type: String, unique: true },
  password: { type: String },
});

module.exports = mongoose.model("Teacher", teacherSchema);
