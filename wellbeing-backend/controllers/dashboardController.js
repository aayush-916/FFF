const dashboardService = require('../services/dashboardService');

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
        const schoolId = req.user.school_id;

        // Security check: Ensure the user actually belongs to a school
        if (!schoolId) {
            return res.status(400).json({
                success: false,
                message: 'BAD_REQUEST: User is not associated with a school.'
            });
        }

        // Fetch real data from the service
        const dashboardData = await dashboardService.getSchoolDashboardData(schoolId);

        res.status(200).json({
            success: true,
            ...dashboardData // Spreads the properties into the top level of the JSON response
        });

    } catch (error) {
        console.error('School Dashboard API Error:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
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
