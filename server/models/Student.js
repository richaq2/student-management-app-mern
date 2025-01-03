const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female"], required: true },
  DOB: { type: Date, required: true },
  contact: { type: String, required: true },
  feesPaid: { type: Boolean, required: true },
  feesPaidDate: { type: Date },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", default: null }, 
  username: { type: String, unique: true }, 
  password: { type: String }, 
});

module.exports = mongoose.model("Student", studentSchema);
