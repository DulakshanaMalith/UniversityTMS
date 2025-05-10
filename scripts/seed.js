require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Lecturer = require('../models/Lecturer');
const Module = require('../models/Module');
const Hall = require('../models/Hall');
const Batch = require('../models/Batch');
const Student = require('../models/Student');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clean up existing data
    await Promise.all([
      User.deleteMany({}),
      Lecturer.deleteMany({}),
      Module.deleteMany({}),
      Hall.deleteMany({}),
      Batch.deleteMany({}),
      Student.deleteMany({})
    ]);
    console.log('Cleaned up existing data');

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      password: 'admin123',
      email: 'admin@university.com',
      name: 'System Administrator',
      role: 'admin'
    });
    console.log('Admin user created');

    // Create lecturer users first
    const lecturerUsers = await User.create([
      {
        username: 'john.smith',
        password: 'password123',
        email: 'john.smith@university.com',
        name: 'Dr. John Smith',
        role: 'lecturer'
      },
      {
        username: 'sarah.johnson',
        password: 'password123',
        email: 'sarah.johnson@university.com',
        name: 'Dr. Sarah Johnson',
        role: 'lecturer'
      },
      {
        username: 'michael.brown',
        password: 'password123',
        email: 'michael.brown@university.com',
        name: 'Dr. Michael Brown',
        role: 'lecturer'
      }
    ]);
    console.log('Lecturer users created');

    // Create lecturers
    const lecturers = await Lecturer.create([
      {
        user: lecturerUsers[0]._id,
        name: 'Dr. John Smith',
        email: 'john.smith@university.com',
        phone_number: '+1234567890',
        department: 'Computer Science',
        rank: 'Professor',
        specialization: 'Software Engineering'
      },
      {
        user: lecturerUsers[1]._id,
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@university.com',
        phone_number: '+1234567891',
        department: 'Computer Science',
        rank: 'Senior Lecturer',
        specialization: 'Database Systems'
      },
      {
        user: lecturerUsers[2]._id,
        name: 'Dr. Michael Brown',
        email: 'michael.brown@university.com',
        phone_number: '+1234567892',
        department: 'Computer Science',
        rank: 'Lecturer',
        specialization: 'Artificial Intelligence'
      }
    ]);
    console.log('Lecturers created');

    // Create halls
    const halls = await Hall.create([
      {
        hall_name: 'Lab 1',
        capacity: 30,
        type: 'lab',
        building: 'Computing Building',
        floor: 1,
        facilities: ['Computers', 'Projector', 'Whiteboard']
      },
      {
        hall_name: 'Lecture Hall A',
        capacity: 100,
        type: 'lecture',
        building: 'Main Building',
        floor: 2,
        facilities: ['Projector', 'Sound System', 'Whiteboard']
      },
      {
        hall_name: 'Tutorial Room 1',
        capacity: 40,
        type: 'tutorial',
        building: 'Main Building',
        floor: 1,
        facilities: ['Whiteboard', 'Smart Board']
      }
    ]);
    console.log('Halls created');

    // Create modules
    const modules = await Module.create([
      {
        module_code: 'CS101',
        module_name: 'Introduction to Programming',
        credit_hours: 4,
        type: 'core',
        semester: 1,
        lecturer: lecturers[0]._id,
        is_lab_required: true,
        description: 'Introduction to programming concepts using Python',
        specialization: 'Programming'
      },
      {
        module_code: 'CS201',
        module_name: 'Database Management Systems',
        credit_hours: 3,
        type: 'core',
        semester: 2,
        lecturer: lecturers[1]._id,
        is_lab_required: true,
        description: 'Fundamentals of database design and SQL',
        specialization: 'Database Systems'
      },
      {
        module_code: 'CS301',
        module_name: 'Artificial Intelligence',
        credit_hours: 4,
        type: 'elective',
        semester: 3,
        lecturer: lecturers[2]._id,
        is_lab_required: false,
        description: 'Introduction to AI concepts and machine learning',
        specialization: 'Artificial Intelligence'
      }
    ]);
    console.log('Modules created');

    // Create batches
    const batches = await Batch.create([
      {
        batch_name: 'Computer Science 2023',
        batch_code: '2023CS',
        department: 'Computer Science',
        academic_year: 2023,
        num_of_students: 60,
        modules: [modules[0]._id, modules[1]._id],
        semester: 1,
        weekend_or_weekday: 'Weekday'
      },
      {
        batch_name: 'Computer Science 2022',
        batch_code: '2022CS',
        department: 'Computer Science',
        academic_year: 2022,
        num_of_students: 45,
        modules: [modules[1]._id, modules[2]._id],
        semester: 3,
        weekend_or_weekday: 'Weekend'
      }
    ]);
    console.log('Batches created');

    // Create student user
    const studentUser = await User.create({
      username: 'john.doe',
      password: 'password123',
      email: 'john.doe@university.com',
      name: 'John Doe',
      role: 'student'
    });
    console.log('Student user created');

    // Create student
    const student = await Student.create({
      user: studentUser._id,
      batch: batches[0]._id,
      batch_code: batches[0].batch_code,
      name: 'John Doe',
      email: 'john.doe@university.com',
      group: 1,
      registration_number: 'CS2023001'
    });
    console.log('Student created');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
