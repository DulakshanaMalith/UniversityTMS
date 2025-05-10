require('dotenv').config();
const mongoose = require('mongoose');
const Module = require('../models/Module');
const Lecturer = require('../models/Lecturer');
const logger = require('../utils/logger');

const createInitialModules = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        logger.info('Connected to MongoDB Atlas');

        // First, get a lecturer to assign to modules
        const lecturer = await Lecturer.findOne();
        if (!lecturer) {
            throw new Error('No lecturer found in the database. Please create a lecturer first.');
        }

        // Sample modules data
        const modulesData = [
            {
                module_name: 'Introduction to Programming',
                credit_hours: 4,
                specialization: 'Computer Science',
                is_lab: true,
                lecturer: lecturer._id
            },
            {
                module_name: 'Database Management Systems',
                credit_hours: 3,
                specialization: 'Computer Science',
                is_lab: true,
                lecturer: lecturer._id
            },
            {
                module_name: 'Software Engineering',
                credit_hours: 3,
                specialization: 'Computer Science',
                is_lab: false,
                lecturer: lecturer._id
            },
            {
                module_name: 'Web Development',
                credit_hours: 4,
                specialization: 'Computer Science',
                is_lab: true,
                lecturer: lecturer._id
            },
            {
                module_name: 'Data Structures and Algorithms',
                credit_hours: 4,
                specialization: 'Computer Science',
                is_lab: false,
                lecturer: lecturer._id
            }
        ];

        // Delete existing modules
        await Module.deleteMany({});
        logger.info('Cleared existing modules');

        // Insert new modules
        const createdModules = await Module.insertMany(modulesData);
        logger.info(`Created ${createdModules.length} modules successfully`);

        // Log the created modules
        createdModules.forEach(module => {
            logger.info(`Created module: ${module.module_name}`);
        });

        mongoose.disconnect();
        logger.info('Disconnected from MongoDB');

    } catch (error) {
        logger.error('Error creating modules:', error);
        process.exit(1);
    }
};

createInitialModules();
