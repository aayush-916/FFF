const teacherModel = require('../models/teacherModel');
const bcrypt = require('bcrypt');

// @desc    Get all teachers and admins for a school
// @route   GET /api/v1/teachers
// @access  Private (school_super_admin, school_admin)
exports.getAllTeachers = async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        if (!schoolId) {
            return res.status(400).json({ success: false, message: 'User is not assigned to a school' });
        }

        const teachers = await teacherModel.getTeachersBySchool(schoolId);

        res.status(200).json({
            success: true,
            data: teachers
        });
    } catch (error) {
        console.error('Teacher API Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch teachers' });
    }
};

// @desc    Create a new teacher and assign classes
// @route   POST /api/v1/teachers
// @access  Private (school_super_admin, school_admin)
exports.createTeacher = async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { name, username, password, role, assigned_classes } = req.body;

        // 1. Validate required fields
        if (!name || !username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, username, and password are required' 
            });
        }

        if (!schoolId) {
            return res.status(400).json({ 
                success: false, 
                message: 'BAD_REQUEST: User is not assigned to a school' 
            });
        }

        // 2. Hash the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 3. Create teacher and assign classes
        await teacherModel.createTeacher(
            schoolId, 
            name, 
            username, 
            passwordHash, 
            role, 
            assigned_classes
        );

        res.status(201).json({ 
            success: true, 
            message: 'Teacher created successfully' 
        });

    } catch (error) {
        console.error('Create Teacher Error:', error.message);
        
        // Handle duplicate username error gracefully
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ 
                success: false, 
                message: 'Username already exists' 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: 'Failed to create teacher' 
        });
    }
};

// Add this to controllers/teacherController.js

// @desc    Update classes assigned to a teacher
// @route   PUT /api/v1/teachers/:id/classes
// @access  Private (school_super_admin, school_admin)
exports.updateClasses = async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const teacherId = req.params.id;
        const { classes } = req.body;

        if (!Array.isArray(classes)) {
            return res.status(400).json({ success: false, message: 'Classes must be provided as an array' });
        }

        await teacherModel.updateTeacherClasses(teacherId, schoolId, classes);

        res.status(200).json({ success: true, message: 'Teacher classes updated successfully' });
    } catch (error) {
        console.error('Update Teacher Classes Error:', error.message);
        if (error.message.includes('NOT_FOUND')) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }
        res.status(500).json({ success: false, message: 'Failed to update classes' });
    }
};
