const sessionService = require('../services/sessionService');

const handleError = (res, error) => {
    console.error('Session API Error:', error.message);
    if (error.message.includes('NOT_FOUND')) {
        return res.status(404).json({ success: false, message: error.message.replace('NOT_FOUND: ', '') });
    }
    if (error.message.includes('BAD_REQUEST')) {
        return res.status(400).json({ success: false, message: error.message.replace('BAD_REQUEST: ', '') });
    }
    res.status(500).json({ success: false, message: 'Internal Server Error' });
};

// @desc    Create a new session (Log a conducted lesson)
// @route   POST /api/v1/sessions
exports.createSession = async (req, res) => {
    try {
        // We pass both the body data and the authenticated user data (from JWT)
        const newSession = await sessionService.createSession(req.body, req.user);
        res.status(201).json({ success: true, data: newSession });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get session history
// @route   GET /api/v1/sessions
// @access  Private (teacher, school_admin, school_super_admin)
exports.getSessions = async (req, res) => {
    try {
        // 1. Initialize our filters object
        const filters = {};

        // 2. Role-Based Data Scoping
        if (req.user.role === 'teacher') {
            // If it's a teacher, ONLY show their own sessions
            filters.teacher_id = req.user.user_id; 
        } else if (req.user.role === 'school_admin' || req.user.role === 'school_super_admin') {
            // If it's an admin, show all sessions for their specific school
            filters.school_id = req.user.school_id;
            
            // Optional: Allow admins to filter by a specific teacher from the frontend
            if (req.query.teacher_id) {
                filters.teacher_id = req.query.teacher_id;
            }
        }

        // 3. Optional: Allow filtering by habit_id if the frontend requests it
        if (req.query.habit_id) {
            filters.habit_id = req.query.habit_id;
        }

        // 4. Fetch the filtered data from the service
        const sessions = await sessionService.getAllSessions(filters);

        res.status(200).json({
            success: true,
            data: sessions
        });
        
    } catch (error) {
        console.error('Session History API Error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch session history' 
        });
    }
};

// @desc    Get single session by ID
// @route   GET /api/v1/sessions/:id
exports.getSession = async (req, res) => {
    try {
        const session = await sessionService.getSessionById(req.params.id);
        res.status(200).json({ success: true, data: session });
    } catch (error) {
        handleError(res, error);
    }
};