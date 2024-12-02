const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  year: { type: Number, required: true },
  fees: { type: Number, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null }, // Optional
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: [] }], // Optional
});

module.exports = mongoose.model('Class', classSchema);
