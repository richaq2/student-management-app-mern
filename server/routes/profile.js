const express = require('express');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');

const router = express.Router();

// Student Profile
router.get('/student/:id', async (req, res) => {
  const student = await Student.findById(req.params.id).populate('class');
  if (!student) return res.status(404).send('Student not found');
  res.json(student);
});

// Teacher Profile
router.get('/teacher/:id', async (req, res) => {
  const teacher = await Teacher.findById(req.params.id).populate('assignedClass');
  if (!teacher) return res.status(404).send('Teacher not found');
  res.json(teacher);
});

// Classroom Details
router.get('/class/:id', async (req, res) => {
  const classroom = await Class.findById(req.params.id)
    .populate('teacher')
    .populate('students');
  if (!classroom) return res.status(404).send('Class not found');
  res.json(classroom);
});

module.exports = router;
