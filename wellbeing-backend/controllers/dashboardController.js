const dashboardService = require('../services/dashboardService');
const dashboardModel = require('../models/dashboardModel');
// @desc    Get NGO Super Admin Dashboard Statistics
// @route   GET /api/v1/dashboard/ngo
exports.getNgoDashboard = async (req, res) => {
    try {
        const stats = await dashboardService.getNgoDashboardData();
        
        res.status(200).json({
            // Spreading the stats object to match your exact required JSON output
            ...stats 
        });
    } catch (error) {
        console.error('NGO Dashboard API Error:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Replace your existing getSchoolDashboard function with this:

// @desc    Get School Dashboard Statistics
// @route   GET /api/v1/dashboard/school
// @access  Private (school_admin, teacher)
exports.getSchoolDashboard = async (req, res) => {
    try {
        // Securely grab the school_id from the logged-in user's token
        const schoolId = req.user.school_id;

        if (!schoolId) {
            return res.status(403).json({ 
                success: false, 
                message: "Access Denied: No school assigned to this user." 
            });
        }

        // Fetch the newly formatted stats from the Model
        const stats = await dashboardModel.getSchoolStats(schoolId);

        // Return the exact JSON structure requested
        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error("🚨 Dashboard API Error:", error);
        res.status(500).json({ success: false, message: "Error loading dashboard data" });
    }
};

// Add this below your getSchoolDashboard function

// @desc    Get Teacher Dashboard Statistics
// @route   GET /api/v1/dashboard/teacher
// @access  Private (teacher, school_admin)
exports.getTeacherDashboard = async (req, res) => {
    try {
        const teacherId = req.user.user_id; // user_id is extracted from the JWT by authMiddleware

        const dashboardData = await dashboardService.getTeacherDashboardData(teacherId);

        res.status(200).json({
            success: true,
            data: dashboardData // Wrapped in 'data' object per your requirements
        });

    } catch (error) {
        console.error('Teacher Dashboard API Error:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
