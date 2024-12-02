const express = require('express');
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
    const newClass = await Class.create(req.body); // No teacher or students required
    res.status(201).json(newClass);
  } catch (error) {
    res.status(400).json({ message: 'Error creating class', error: error.message });
  }
});

router.put('/classes/:id', async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedClass);
  } catch (error) {
    res.status(400).json({ message: 'Error updating class', error: error.message });
  }
});

router.delete('/classes/:id', async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting class', error: error.message });
  }
});

router.put('/classes/:id/assign-teacher', async (req, res) => {
    const { teacherId } = req.body;
    try {
      const teacherObjectId = mongoose.Types.ObjectId(teacherId); // Convert to ObjectId
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
  
      updatedClass.students.push(...studentIds);
      await updatedClass.save();
  
      await Student.updateMany({ _id: { $in: studentIds } }, { $set: { class: updatedClass._id } });
  
      res.json({ message: 'Students assigned successfully', class: updatedClass });
    } catch (error) {
      res.status(400).json({ message: 'Error assigning students', error: error.message });
    }
  });
  

  router.get('/student', async (req, res) => {
    try {
      const student = await Student.find().populate('class');
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching student profile', error: error.message });
    }
  });

  router.get('/student/:id', async (req, res) => {
    try {
      const student = await Student.findById(req.params.id).populate('class');
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching student profile', error: error.message });
    }
  });

  
  module.exports = router ;