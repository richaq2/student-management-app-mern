const mongoose = require('mongoose');
const Class = require('./models/Class');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');
const data = require('./data.json'); // Assuming the fake data is in a JSON file

const populateDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://admin:admin@cluster0.uepbm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await Class.deleteMany({});
    await Teacher.deleteMany({});
    await Student.deleteMany({});
    console.log('Existing data cleared');

    // Insert Classes
    const classes = await Class.insertMany(data.classes);
    console.log(`Inserted ${classes.length} classes`);

    // Insert Teachers (without assignedClass)
    const teachers = await Teacher.insertMany(
      data.teachers.map((teacher) => ({
        ...teacher,
        assignedClass: null, // Initially no class assigned
      }))
    );
    console.log(`Inserted ${teachers.length} teachers`);

    // Insert Students (without class)
    const students = await Student.insertMany(
      data.students.map((student) => ({
        ...student,
        class: null, // Initially no class assigned
      }))
    );
    console.log(`Inserted ${students.length} students`);

    // Assign Teachers to Classes
    for (let i = 0; i < classes.length; i++) {
      const cls = classes[i];
      const teacher = teachers[i % teachers.length]; // Assign in round-robin if fewer teachers than classes
      await Class.findByIdAndUpdate(cls._id, { teacher: teacher._id });
      await Teacher.findByIdAndUpdate(teacher._id, { assignedClass: cls._id });
    }
    console.log('Teachers assigned to classes');

    // Assign Students to Classes
    const studentsPerClass = Math.ceil(students.length / classes.length);
    for (let i = 0; i < classes.length; i++) {
      const cls = classes[i];
      const startIndex = i * studentsPerClass;
      const classStudents = students.slice(startIndex, startIndex + studentsPerClass); // Correctly defined

      const studentIds = classStudents.map((student) => student._id);

      await Class.findByIdAndUpdate(cls._id, { students: studentIds });
      await Student.updateMany({ _id: { $in: studentIds } }, { $set: { class: cls._id } });
    }
    console.log('Students assigned to classes');

    console.log('Database populated successfully');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error populating database:', error);
    mongoose.disconnect();
  }
};

populateDatabase();
