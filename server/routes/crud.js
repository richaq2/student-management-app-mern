const express = require('express');
const mongoose = require('mongoose');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

const router = express.Router();

// CRUD for Classes
router.get('/classes', async (req, res) => {
  try {
    const classes = await Class.find().populate('teacher').populate('students');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes', error: error.message });
  }
});

router.post('/classes', async (req, res) => {
  try {
    const newClass = await Class.create(req.body);
    res.status(201).json(newClass);
  } catch (error) {
    res.status(400).json({ message: 'Error creating class', error: error.message });
  }
});

router.put('/classes/:id', async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedClass) return res.status(404).json({ message: 'Class not found' });
    res.json(updatedClass);
  } catch (error) {
    res.status(400).json({ message: 'Error updating class', error: error.message });
  }
});

router.delete('/classes/:id', async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    if (!deletedClass) return res.status(404).json({ message: 'Class not found' });
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting class', error: error.message });
  }
});

router.put('/classes/:id/assign-teacher', async (req, res) => {
  const { teacherId } = req.body;
  try {
    const teacherObjectId = mongoose.Types.ObjectId(teacherId);
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      { teacher: teacherObjectId },
      { new: true }
    );

    if (!updatedClass) return res.status(404).json({ message: 'Class not found' });

    await Teacher.findByIdAndUpdate(teacherObjectId, { assignedClass: updatedClass._id });

    res.json({ message: 'Teacher assigned successfully', class: updatedClass });
  } catch (error) {
    res.status(400).json({ message: 'Error assigning teacher', error: error.message });
  }
});

router.put('/classes/:id/assign-students', async (req, res) => {
  const { studentIds } = req.body;
  try {
    const updatedClass = await Class.findById(req.params.id);
    if (!updatedClass) return res.status(404).json({ message: 'Class not found' });

    const students = await Student.find({ _id: { $in: studentIds } });
    if (students.length !== studentIds.length) {
      return res.status(400).json({ message: 'One or more students not found' });
    }

    // Avoid duplicates
    const currentStudentIds = updatedClass.students.map(id => id.toString());
    studentIds.forEach(id => {
      if (!currentStudentIds.includes(id)) {
        updatedClass.students.push(id);
      }
    });

    await updatedClass.save();

    await Student.updateMany({ _id: { $in: studentIds } }, { $set: { class: updatedClass._id } });

    res.json({ message: 'Students assigned successfully', class: updatedClass });
  } catch (error) {
    res.status(400).json({ message: 'Error assigning students', error: error.message });
  }
});

// CRUD for Students
// Get all students
router.get('/student', async (req, res) => {
  try {
    const students = await Student.find().populate('class');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
});

// Get a student by ID
router.get('/student/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('class');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student profile', error: error.message });
  }
});

// Create a new student
router.post('/student', async (req, res) => {
  try {
    const newStudent = await Student.create(req.body);
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: 'Error creating student', error: error.message });
  }
});

// Update a student
router.put('/student/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedStudent) return res.status(404).json({ message: 'Student not found' });
    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: 'Error updating student', error: error.message });
  }
});

// Delete a student
router.delete('/student/:id', async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) return res.status(404).json({ message: 'Student not found' });

    // Remove the student from their class's students array
    await Class.updateMany({}, { $pull: { students: req.params.id } });

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student', error: error.message });
  }
});

// CRUD for Teachers
// Get all teachers
router.get('/teacher', async (req, res) => {
  try {
    const teachers = await Teacher.find().populate({
      path: 'assignedClass',
      populate: { path: 'students' },
    });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teachers', error: error.message });
  }
});

// Get a teacher by ID
router.get('/teacher/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate({
      path: 'assignedClass',
      populate: { path: 'students' },
    });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teacher profile', error: error.message });
  }
});

// Create a new teacher
router.post('/teacher', async (req, res) => {
  try {
    const newTeacher = await Teacher.create(req.body);
    res.status(201).json(newTeacher);
  } catch (error) {
    res.status(400).json({ message: 'Error creating teacher', error: error.message });
  }
});

// Update a teacher
router.put('/teacher/:id', async (req, res) => {
  try {
    const updatedTeacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTeacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json(updatedTeacher);
  } catch (error) {
    res.status(400).json({ message: 'Error updating teacher', error: error.message });
  }
});

// Delete a teacher
router.delete('/teacher/:id', async (req, res) => {
  try {
    const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!deletedTeacher) return res.status(404).json({ message: 'Teacher not found' });

    // Remove the teacher from any classes they're assigned to
    await Class.updateMany({ teacher: req.params.id }, { $unset: { teacher: '' } });

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting teacher', error: error.message });
  }
});

module.exports = router;
