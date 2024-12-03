const express = require('express');
const mongoose = require('mongoose');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

const router = express.Router();

// CRUD for Classes

// Get all classes
router.get('/classes', async (req, res) => {
  try {
    const classes = await Class.find().populate('teacher').populate('students');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes', error: error.message });
  }
});

// Get a class by ID
router.get('/classes/:id', async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('teacher')
      .populate('students');
    if (!classData) return res.status(404).json({ message: 'Class not found' });
    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching class data', error: error.message });
  }
});

// Create a new class
router.post('/classes', async (req, res) => {
  try {
    const newClass = await Class.create(req.body);

    // Update teacher's assignedClass
    if (newClass.teacher) {
      await Teacher.findByIdAndUpdate(newClass.teacher, { assignedClass: newClass._id });
    }

    // Update students' class field
    if (newClass.students && newClass.students.length > 0) {
      await Student.updateMany(
        { _id: { $in: newClass.students } },
        { class: newClass._id }
      );
    }

    res.status(201).json(newClass);
  } catch (error) {
    res.status(400).json({ message: 'Error creating class', error: error.message });
  }
});

// Update a class
router.put('/classes/:id', async (req, res) => {
  try {
    const { teacher: newTeacherId, students: newStudentsArray, ...rest } = req.body;

    // Fetch the existing class
    const classData = await Class.findById(req.params.id);
    if (!classData) return res.status(404).json({ message: 'Class not found' });

    const oldTeacherId = classData.teacher ? classData.teacher.toString() : null;
    const oldStudentsArray = classData.students.map((id) => id.toString());

    const updatedFields = { ...rest };

    // Handle teacher update
    if (newTeacherId !== undefined) {
      updatedFields.teacher = newTeacherId;
    }

    // Handle students update
    if (newStudentsArray !== undefined) {
      updatedFields.students = newStudentsArray;
    }

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    // Handle teacher changes
    if (newTeacherId !== undefined && oldTeacherId !== newTeacherId) {
      // Update the old teacher's assignedClass field
      if (oldTeacherId) {
        await Teacher.findByIdAndUpdate(oldTeacherId, { $unset: { assignedClass: '' } });
      }
      // Update the new teacher's assignedClass field
      if (newTeacherId) {
        await Teacher.findByIdAndUpdate(newTeacherId, { assignedClass: req.params.id });
      }
    }

    // Handle students changes
    if (newStudentsArray !== undefined) {
      const newStudentsSet = new Set(newStudentsArray.map((id) => id.toString()));
      const oldStudentsSet = new Set(oldStudentsArray);

      // Students to add
      const studentsToAdd = newStudentsArray.filter(
        (id) => !oldStudentsSet.has(id.toString())
      );
      // Students to remove
      const studentsToRemove = oldStudentsArray.filter(
        (id) => !newStudentsSet.has(id)
      );

      // Update studentsToAdd
      if (studentsToAdd.length > 0) {
        await Student.updateMany(
          { _id: { $in: studentsToAdd } },
          { class: req.params.id }
        );
      }

      // Update studentsToRemove
      if (studentsToRemove.length > 0) {
        await Student.updateMany(
          { _id: { $in: studentsToRemove } },
          { $unset: { class: '' } }
        );
      }
    }

    res.json(updatedClass);
  } catch (error) {
    res.status(400).json({ message: 'Error updating class', error: error.message });
  }
});

// Delete a class
router.delete('/classes/:id', async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    if (!deletedClass) return res.status(404).json({ message: 'Class not found' });

    // Update students
    if (deletedClass.students && deletedClass.students.length > 0) {
      await Student.updateMany(
        { _id: { $in: deletedClass.students } },
        { $unset: { class: '' } }
      );
    }

    // Update teacher
    if (deletedClass.teacher) {
      await Teacher.findByIdAndUpdate(deletedClass.teacher, { $unset: { assignedClass: '' } });
    }

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
    const { class: classId, ...studentData } = req.body;

    const newStudent = await Student.create({ ...studentData, class: classId });

    if (classId) {
      // Add the student to the class
      await Class.findByIdAndUpdate(classId, { $addToSet: { students: newStudent._id } });
    }

    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: 'Error creating student', error: error.message });
  }
});

// Update a student
router.put('/student/:id', async (req, res) => {
  try {
    const { class: newClassId, ...rest } = req.body;

    // Fetch the existing student
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const oldClassId = student.class ? student.class.toString() : null;
    const updatedFields = { ...rest };

    // Update the student's class
    if (newClassId) {
      updatedFields.class = newClassId;
    } else {
      updatedFields.class = null;
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    // Update the old class's students array
    if (oldClassId && oldClassId !== newClassId) {
      await Class.findByIdAndUpdate(oldClassId, { $pull: { students: req.params.id } });
    }

    // Update the new class's students array
    if (newClassId && oldClassId !== newClassId) {
      await Class.findByIdAndUpdate(newClassId, { $addToSet: { students: req.params.id } });
    }

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

    if (deletedStudent.class) {
      // Remove the student from their class's students array
      await Class.findByIdAndUpdate(deletedStudent.class, { $pull: { students: req.params.id } });
    }

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
    const { assignedClass: classId, ...teacherData } = req.body;

    const newTeacher = await Teacher.create({ ...teacherData, assignedClass: classId });

    if (classId) {
      // Assign the teacher to the class
      await Class.findByIdAndUpdate(classId, { $addToSet: { teacher: newTeacher._id } });
    }

    res.status(201).json(newTeacher);
  } catch (error) {
    res.status(400).json({ message: 'Error creating teacher', error: error.message });
  }
});

// Update a teacher
router.put('/teacher/:id', async (req, res) => {
  try {
    const { assignedClass: newClassId, ...rest } = req.body;

    // Fetch the existing teacher
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const oldClassId = teacher.assignedClass ? teacher.assignedClass.toString() : null;
    const updatedFields = { ...rest };

    // Update the teacher's assignedClass
    if (newClassId) {
      updatedFields.assignedClass = newClassId;
    } else {
      updatedFields.assignedClass = null;
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    // Update the old class's teacher field
    if (oldClassId && oldClassId !== newClassId) {
      await Class.findByIdAndUpdate(oldClassId, { $unset: { teacher: '' } });
    }

    // Update the new class's teacher field
    if (newClassId && oldClassId !== newClassId) {
      await Class.findByIdAndUpdate(newClassId, { teacher: req.params.id });
    }

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

    if (deletedTeacher.assignedClass) {
      // Remove the teacher from their assigned class
      await Class.findByIdAndUpdate(deletedTeacher.assignedClass, { $unset: { teacher: '' } });
    }

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting teacher', error: error.message });
  }
});


// Simplified Financial analytics endpoint
router.get('/analytics/financial', async (req, res) => {
  try {
    // Expenses Calculation: Sum of salaries of all teachers
    const teachers = await Teacher.find({});
    const expenses = teachers.reduce((sum, teacher) => sum + (teacher.salary || 0), 0);

    // Income Calculation: Sum of fees from all students who have paid
    const students = await Student.find({ feesPaid: true }).populate('class');

    let income = 0;
    const classFeesCache = {};

    for (const student of students) {
      if (student.class && student.class._id) {
        const classId = student.class._id.toString();
        let classFee = classFeesCache[classId];

        if (classFee === undefined) {
          classFee = student.class.fees || 0;
          classFeesCache[classId] = classFee;
        }

        income += classFee;
      }
    }

    res.json({ expenses, income });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching financial data', error: error.message });
  }
});



module.exports = router;
