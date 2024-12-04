// routes/crud.js
const express = require('express');
const mongoose = require('mongoose');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const generateStudentUsername = require('../utils/generateStudentUsername');
const generateTeacherUsername = require('../utils/generateTeacherUsername');
const { generatePassword, hashPassword } = require('../utils/passwordUtils');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/stats - Accessible to authenticated users
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const class_count = await Class.countDocuments();
    const teacher_count = await Teacher.countDocuments();
    const student_count = await Student.countDocuments();
    const response = [
      { title: 'Total Classes', count: class_count, color: 'bg-green-500' },
      { title: 'Total Teachers', count: teacher_count, color: 'bg-blue-500' },
      { title: 'Total Students', count: student_count, color: 'bg-yellow-500' },
    ];
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// GET /api/profile/me - Accessible to all authenticated users
router.get('/me', verifyToken, async (req, res) => {
  try {
    const { role, username } = req.user;

    if (role === 'teacher') {
      const teacher = await Teacher.findOne({ username })
        .populate({
          path: 'assignedClass',
          populate: { path: 'students' }
        });
      if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
      return res.json(teacher);
    }

    if (role === 'student') {
      const student = await Student.findOne({ username }).populate({
        path: 'class',
        populate: { path: 'teacher' }
      });
      if (!student) return res.status(404).json({ message: 'Student not found' });
      return res.json(student);
    }

    return res.status(400).json({ message: 'Invalid user role' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// PUT /api/profile/me - Accessible to all authenticated users for updating their own profile
router.put('/me', verifyToken, async (req, res) => {
  try {
    const { role, username } = req.user;
    const updates = req.body;

    // Define allowed fields for each role
    const allowedUpdates = {
      teacher: ['name', 'gender', 'contact', 'DOB'],
      student: ['name', 'gender', 'contact', 'DOB'],
      admin: ['name', 'gender', 'contact', 'DOB']
    };

    // Check if the fields in updates are allowed
    const updateKeys = Object.keys(updates);
    const isValidOperation = updateKeys.every(key => allowedUpdates[role].includes(key));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates!' });
    }

    let userProfile;

    if (role === 'teacher') {
      userProfile = await Teacher.findOne({ username });
      if (!userProfile) return res.status(404).json({ message: 'Teacher not found' });
    } else if (role === 'student') {
      userProfile = await Student.findOne({ username });
      if (!userProfile) return res.status(404).json({ message: 'Student not found' });
    } else if (role === 'admin') {
      userProfile = await Admin.findOne({ username });
      if (!userProfile) return res.status(404).json({ message: 'Admin not found' });
    } else {
      return res.status(400).json({ message: 'Invalid user role' });
    }

    // Apply updates
    updateKeys.forEach(key => {
      userProfile[key] = updates[key];
    });

    await userProfile.save();

    // Populate related fields if necessary
    if (role === 'teacher') {
      userProfile = await Teacher.findOne({ username })
        .populate({
          path: 'assignedClass',
          populate: { path: 'students' }
        });
    } else if (role === 'student') {
      userProfile = await Student.findOne({ username }).populate('class');
    }

    res.json(userProfile);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// CRUD for Classes

// GET /api/classes - Accessible to authenticated users
router.get('/classes', verifyToken, async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('teacher')
      .populate('students');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes', error: error.message });
  }
});

// GET /api/classes/:id - Accessible to authenticated users
router.get('/classes/:id', verifyToken, async (req, res) => {
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

// POST /api/classes - Admin Only
router.post('/classes', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, year, fees, teacher, students } = req.body;

    // Check if class already exists
    const existingClass = await Class.findOne({ name, year });
    if (existingClass) {
      return res.status(400).json({ message: 'Class already exists for this year.' });
    }

    const newClass = new Class({ name, year, fees });

    // Assign teacher if provided
    if (teacher) {
      newClass.teacher = teacher;
      // Update teacher's assignedClass
      await Teacher.findByIdAndUpdate(teacher, { assignedClass: newClass._id });
    }

    // Assign students if provided
    if (students && students.length > 0) {
      newClass.students = students;
      // Update students' class field
      await Student.updateMany(
        { _id: { $in: students } },
        { class: newClass._id }
      );
    }

    await newClass.save();

    res.status(201).json(newClass);
  } catch (error) {
    res.status(400).json({ message: 'Error creating class', error: error.message });
  }
});

// PUT /api/classes/:id - Admin Only
router.put('/classes/:id', verifyToken, verifyAdmin, async (req, res) => {
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

// DELETE /api/classes/:id - Admin Only
router.delete('/classes/:id', verifyToken, verifyAdmin, async (req, res) => {
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

// PUT /api/classes/:id/assign-teacher - Admin Only
router.put('/classes/:id/assign-teacher', verifyToken, verifyAdmin, async (req, res) => {
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

// PUT /api/classes/:id/assign-students - Admin Only
router.put('/classes/:id/assign-students', verifyToken, verifyAdmin, async (req, res) => {
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

// GET /api/student - Admin Only
router.get('/student', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const students = await Student.find().populate('class');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
});

// GET /api/student/:id - Accessible to authenticated users (students can access their own profile)
router.get('/student/:id', verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('class');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // If the requester is a student, ensure they are accessing their own profile
    if (req.user.role === 'student' && req.user.username !== student.username) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student profile', error: error.message });
  }
});

// POST /api/student - Admin Only
router.post('/student', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, gender, DOB, contact, feesPaid, class: classId, feesPaidDate } = req.body;

    // Validate class existence
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(400).json({ message: 'Invalid class ID provided.' });
    }

    // Check if class has reached its student limit
    if (classData.students.length >= classData.studentLimit) {
      return res.status(400).json({ message: 'Class has reached its student limit.' });
    }

    // Create new student instance
    const student = new Student({
      name,
      gender,
      DOB,
      contact,
      feesPaid,
      class: classId,
      feesPaidDate,
    });

    // Generate unique username
    const username = await generateStudentUsername(student);
    student.username = username;

    // Generate default password
    const defaultPassword = generatePassword(name, new Date(DOB));

    // Hash the password
    const hashedPassword = await hashPassword(defaultPassword);
    student.password = hashedPassword;

    // Save student to the database
    await student.save();

    // Assign student to class
    await Class.findByIdAndUpdate(classId, { $addToSet: { students: student._id } });

    res.status(201).json({
      message: 'Student created successfully.',
      student: {
        name: student.name,
        username: student.username,
        password: defaultPassword, // In production, do not send passwords like this
      },
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// PUT /api/student/:id - Admin Only
router.put('/student/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { class: newClassId, ...rest } = req.body;

    // Prevent username update
    if (rest.username) {
      return res.status(400).json({ message: 'Username cannot be updated.' });
    }

    // Fetch the existing student
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const oldClassId = student.class ? student.class.toString() : null;

    if(oldClassId !== newClassId){
      // Validate class existence
    const classData = await Class.findById(newClassId);
    if (!classData) {
      return res.status(400).json({ message: 'Invalid class ID provided.' });
    }

    // Check if class has reached its student limit
    if (classData.students.length >= classData.studentLimit) {
      return res.status(400).json({ message: 'Class has reached its student limit.' });
    }
    }

    const updatedFields = { ...rest };

    // Update the student's class
    if (newClassId) {
      // Validate new class
      const classData = await Class.findById(newClassId);
      if (!classData) {
        return res.status(400).json({ message: 'Invalid new class ID provided.' });
      }
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

// DELETE /api/student/:id - Admin Only
router.delete('/student/:id', verifyToken, verifyAdmin, async (req, res) => {
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

// GET /api/teacher - Admin Only
router.get('/teacher', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const teachers = await Teacher.find().populate('assignedClass');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teachers', error: error.message });
  }
});

// GET /api/teacher/:id - Accessible to authenticated users (teachers can access their own profile)
router.get('/teacher/:id', verifyToken, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate('assignedClass');
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    // If the requester is a teacher, ensure they are accessing their own profile
    if (req.user.role === 'teacher' && req.user.username !== teacher.username) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teacher profile', error: error.message });
  }
});

// POST /api/teacher - Admin Only
router.post('/teacher', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, gender, DOB, contact, salary, assignedClass } = req.body;

    // Validate class existence if assigned
    let classId = null;
    if (assignedClass) {
      const classData = await Class.findById(assignedClass);
      if (!classData) {
        return res.status(400).json({ message: 'Invalid assigned class ID provided.' });
      }
      classId = assignedClass;
    }

    // Create new teacher instance
    const teacher = new Teacher({
      name,
      gender,
      DOB,
      contact,
      salary,
      assignedClass: classId,
    });

    // Generate unique username
    const username = await generateTeacherUsername();
    teacher.username = username;

    // Generate default password
    const defaultPassword = generatePassword(name, new Date(DOB));

    // Hash the password
    const hashedPassword = await hashPassword(defaultPassword);
    teacher.password = hashedPassword;

    // Save teacher to the database
    await teacher.save();

    // Assign teacher to class if provided
    if (classId) {
      await Class.findByIdAndUpdate(classId, { teacher: teacher._id });
    }

    res.status(201).json({
      message: 'Teacher created successfully.',
      teacher: {
        name: teacher.name,
        username: teacher.username,
        password: defaultPassword, // In production, do not send passwords like this
      },
    });
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// PUT /api/teacher/:id - Admin Only
router.put('/teacher/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { assignedClass: newClassId, ...rest } = req.body;

    // Prevent username update
    if (rest.username) {
      return res.status(400).json({ message: 'Username cannot be updated.' });
    }

    // Fetch the existing teacher
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const oldClassId = teacher.assignedClass ? teacher.assignedClass.toString() : null;

    const updatedFields = { ...rest };

    // Update the teacher's assignedClass
    if (newClassId !== undefined) {
      if (newClassId) {
        // Validate new class
        const classData = await Class.findById(newClassId);
        if (!classData) {
          return res.status(400).json({ message: 'Invalid new class ID provided.' });
        }
        updatedFields.assignedClass = newClassId;
      } else {
        updatedFields.assignedClass = null;
      }
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    // Update the old class's teacher field
    if (newClassId !== undefined && oldClassId !== newClassId) {
      // Update the old class to remove the teacher
      if (oldClassId) {
        await Class.findByIdAndUpdate(oldClassId, { $unset: { teacher: '' } });
      }
      // Update the new class to assign the teacher
      if (newClassId) {
        await Class.findByIdAndUpdate(newClassId, { teacher: teacher._id });
      }
    }

    res.json(updatedTeacher);
  } catch (error) {
    res.status(400).json({ message: 'Error updating teacher', error: error.message });
  }
});

// DELETE /api/teacher/:id - Admin Only
router.delete('/teacher/:id', verifyToken, verifyAdmin, async (req, res) => {
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

// Analytics Endpoints

// GET /api/analytics/available-years - Admin Only
router.get('/analytics/available-years', verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Get years from feesPaidDate in Student model
    const studentYears = await Student.aggregate([
      { $match: { feesPaidDate: { $exists: true } } },
      {
        $group: {
          _id: { $year: '$feesPaidDate' },
        },
      },
      { $project: { year: '$_id', _id: 0 } },
    ]);

    // Get years from salaryDate in Teacher model
    const teacherYears = await Teacher.aggregate([
      { $match: { salaryDate: { $exists: true } } },
      {
        $group: {
          _id: { $year: '$salaryDate' },
        },
      },
      { $project: { year: '$_id', _id: 0 } },
    ]);

    // Combine and deduplicate years
    const yearsSet = new Set([...studentYears, ...teacherYears].map((y) => y.year));
    const years = Array.from(yearsSet).sort((a, b) => a - b);

    res.json({ years });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available years', error: error.message });
  }
});

// GET /api/analytics/available-months - Admin Only
router.get('/analytics/available-months', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { year } = req.query;
    if (!year) {
      return res.status(400).json({ message: 'Year is required' });
    }

    const yearInt = parseInt(year);

    // Get months from feesPaidDate in Student model
    const studentMonths = await Student.aggregate([
      {
        $match: {
          feesPaidDate: {
            $exists: true,
            $gte: new Date(yearInt, 0, 1),
            $lte: new Date(yearInt, 11, 31),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$feesPaidDate' },
        },
      },
      { $project: { month: '$_id', _id: 0 } },
    ]);

    // Get months from salaryDate in Teacher model
    const teacherMonths = await Teacher.aggregate([
      {
        $match: {
          salaryDate: {
            $exists: true,
            $gte: new Date(yearInt, 0, 1),
            $lte: new Date(yearInt, 11, 31),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$salaryDate' },
        },
      },
      { $project: { month: '$_id', _id: 0 } },
    ]);

    // Combine and deduplicate months
    const monthsSet = new Set([...studentMonths, ...teacherMonths].map((m) => m.month));
    const months = Array.from(monthsSet).sort((a, b) => a - b);

    res.json({ months });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available months', error: error.message });
  }
});

// GET /api/analytics/financial - Admin Only
router.get('/analytics/financial', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { view, year, month } = req.query;

    if (!year) {
      return res.status(400).json({ message: 'Year is required' });
    }

    let startDate, endDate;

    if (view === 'monthly' && month) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    } else if (view === 'yearly') {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    } else {
      return res.status(400).json({ message: 'Invalid view or missing month' });
    }

    // Expenses Calculation: Sum of teacher salaries paid in the period
    const teachers = await Teacher.find({
      salaryDate: { $gte: startDate, $lte: endDate },
    });

    const expenses = teachers.reduce((sum, teacher) => sum + (teacher.salary || 0), 0);

    // Income Calculation: Sum of fees collected from students in the period
    const paidStudents = await Student.find({
      feesPaid: true,
      feesPaidDate: { $gte: startDate, $lte: endDate },
    }).populate('class');

    let income = 0;

    for (const student of paidStudents) {
      if (student.class && student.class.fees) {
        income += student.class.fees;
      }
    }

    // Unpaid Fees Calculation: Sum of fees from students who have not paid as of the end date
    const unpaidStudents = await Student.find({
      feesPaid: false,
      class: { $ne: null },
    }).populate('class');

    let unpaidFees = 0;

    for (const student of unpaidStudents) {
      if (student.class && student.class.fees) {
        unpaidFees += student.class.fees;
      }
    }

    res.json({ expenses, income, unpaidFees });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching financial data', error: error.message });
  }
});

module.exports = router;
