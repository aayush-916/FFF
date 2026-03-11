const schoolService = require('../services/schoolService');
const schoolModel = require('../models/schoolModel');

// Helper function to handle errors cleanly
const handleError = (res, error) => {
    console.error('School API Error:', error.message);
    
    if (error.message.includes('NOT_FOUND')) {
        return res.status(404).json({ success: false, message: error.message.replace('NOT_FOUND: ', '') });
    }
    if (error.message.includes('BAD_REQUEST')) {
        return res.status(400).json({ success: false, message: error.message.replace('BAD_REQUEST: ', '') });
    }
    // Handle Unique Constraint Violation for School Code
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'A school with this unique code already exists' });
    }
    
    res.status(500).json({ success: false, message: 'Internal Server Error' });
};

// @desc    Create a new school
// @route   POST /api/v1/schools
exports.createSchool = async (req, res) => {
    try {
        const newSchool = await schoolService.createSchool(req.body);
        res.status(201).json({ success: true, data: newSchool });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get all schools
// @route   GET /api/v1/schools
exports.getSchools = async (req, res) => {
    try {
        const schools = await schoolService.getAllSchools();
        res.status(200).json({ success: true, count: schools.length, data: schools });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get single school
// @route   GET /api/v1/schools/:id
exports.getSchool = async (req, res) => {
    try {
        const school = await schoolService.getSchoolById(req.params.id);
        res.status(200).json({ success: true, data: school });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Update school
// @route   PUT /api/v1/schools/:id
exports.updateSchool = async (req, res) => {
    try {
        const updatedSchool = await schoolService.updateSchool(req.params.id, req.body);
        res.status(200).json({ success: true, data: updatedSchool });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Delete school
// @route   DELETE /api/v1/schools/:id
exports.deleteSchool = async (req, res) => {
    try {
        await schoolService.deleteSchool(req.params.id);
        res.status(200).json({ success: true, message: 'School deleted successfully' });
    } catch (error) {
        handleError(res, error);
    }
};

exports.setupClasses = async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        if (!schoolId) throw new Error('BAD_REQUEST: User is not assigned to a school');

        const result = await schoolService.setupSchoolClasses(schoolId, req.body);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        handleError(res, error); // Use your existing handleError logic
    }
};

// @desc    Get all classes for the logged-in user's school
// @route   GET /api/v1/schools/classes
// @access  Private (teacher, school_admin, school_super_admin)
exports.getSchoolClasses = async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        if (!schoolId) {
            return res.status(400).json({ 
                success: false, 
                message: 'BAD_REQUEST: User is not associated with a school.' 
            });
        }

        const classes = await schoolModel.getClassesBySchoolId(schoolId);

        res.status(200).json({
            success: true,
            data: classes
        });
    } catch (error) {
        console.error('School Classes API Error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch school classes' 
        });
    }
};

// Add these to controllers/schoolController.js

// Replace addClass in controllers/schoolController.js

// @desc    Add multiple classes to the school
// @route   POST /api/v1/school/classes
// @access  Private (school_super_admin, school_admin)
exports.addClass = async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { classes } = req.body;

        // Validate the new payload structure
        if (!classes || !Array.isArray(classes) || classes.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'A valid classes array is required' 
            });
        }

        const addedCount = await schoolModel.addClasses(schoolId, classes);

        // Provide a smart response based on how many were actually added
        if (addedCount === 0) {
            return res.status(409).json({ 
                success: false, 
                message: 'All of these classes and sections already exist in your school.' 
            });
        }

        res.status(201).json({ 
            success: true, 
            message: `Successfully added ${addedCount} new class section(s)!` 
        });

    } catch (error) {
        console.error('Add Classes Error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to add classes due to a server error.' 
        });
    }
};
// @desc    Delete a class from the school
// @route   DELETE /api/v1/school/classes/:id
exports.deleteClass = async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const classId = req.params.id;

        const affectedRows = await schoolModel.deleteClass(classId, schoolId);

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Class not found or you do not have permission to delete it' });
        }

        res.status(200).json({ success: true, message: 'Class deleted successfully' });
    } catch (error) {
        console.error('Delete Class Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete class' });
    }
};
