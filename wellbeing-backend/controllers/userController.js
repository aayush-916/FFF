const userService = require('../services/userService');
const userModel = require('../models/userModel');

const handleError = (res, error) => {
    console.error('User API Error:', error.message);
    
    if (error.message.includes('NOT_FOUND')) {
        return res.status(404).json({ success: false, message: error.message.replace('NOT_FOUND: ', '') });
    }
    if (error.message.includes('BAD_REQUEST')) {
        return res.status(400).json({ success: false, message: error.message.replace('BAD_REQUEST: ', '') });
    }
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'This username is already taken' });
    }
    
    res.status(500).json({ success: false, message: 'Internal Server Error' });
};

// @desc    Create new user
// @route   POST /api/v1/users
exports.createUser = async (req, res) => {
    try {
        const newUser = await userService.createUser(req.body);
        res.status(201).json({ success: true, data: newUser });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get all users
// @route   GET /api/v1/users
exports.getUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
exports.getUser = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Update user
// @route   PUT /api/v1/users/:id
exports.updateUser = async (req, res) => {
    try {
        const updatedUser = await userService.updateUser(req.params.id, req.body);
        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
exports.deleteUser = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        handleError(res, error);
    }
};

exports.promoteToAdmin = async (req, res) => {
    try {
        // You can add a quick service function or call model directly here for brevity
        const affectedRows = await userModel.promoteToAdmin(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Teacher not found or already an admin' });
        }
        res.status(200).json({ success: true, message: 'Teacher promoted to school_admin successfully' });
    } catch (error) {
        handleError(res, error);
    }
};

// Add this new function
exports.getTeacherAssignedClasses = async (req, res) => {
    try {
        const teacherId = req.user.user_id;
        // Re-use the fixed model function!
        const classes = await userModel.getTeacherClasses(teacherId);
        
        res.status(200).json({
            success: true,
            data: classes
        });
    } catch (error) {
        console.error('Teacher Classes API Error:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// @desc    Demote a school admin back to a teacher
// @route   PUT /api/v1/users/:id/demote
exports.demoteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Optional Security Check: Prevent a user from demoting themselves!
        if (parseInt(userId) === req.user.id) {
            return res.status(400).json({ 
                success: false, 
                message: "You cannot demote yourself. Please ask another admin to do this." 
            });
        }

        const affectedRows = await userModel.demoteToTeacher(userId);
        
        if (affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found or is not currently a School Admin." 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "User successfully demoted to Teacher." 
        });

    } catch (error) {
        console.error("🚨 Error demoting user:", error);
        res.status(500).json({ success: false, message: "Server error while demoting user." });
    }
};
