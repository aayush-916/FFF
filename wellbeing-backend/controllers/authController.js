const authService = require('../services/authService');

const handleError = (res, error) => {
    console.error('Auth API Error:', error.message);
    
    if (error.message.includes('NOT_FOUND')) {
        return res.status(404).json({ success: false, message: error.message.replace('NOT_FOUND: ', '') });
    }
    if (error.message.includes('BAD_REQUEST')) {
        return res.status(400).json({ success: false, message: error.message.replace('BAD_REQUEST: ', '') });
    }
    if (error.message.includes('UNAUTHORIZED')) {
        return res.status(401).json({ success: false, message: error.message.replace('UNAUTHORIZED: ', '') });
    }
    
    res.status(500).json({ success: false, message: 'Internal Server Error' });
};

// @desc    Login user & set HttpOnly cookie
// @route   POST /api/v1/auth/login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await authService.login(username, password);
        
        // Set the token in an HttpOnly cookie
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production with HTTPS
            sameSite: 'Strict',
            maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year expiry
        });

        // Return the user data (without the token)
        res.status(200).json({
            success: true,
            user: result.user
        });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Logout user & clear cookie
// @route   POST /api/v1/auth/logout
exports.logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await authService.getMe(req.user.user_id);
        
        res.status(200).json({
            success: true,
            user: user
        });
    } catch (error) {
        handleError(res, error);
    }
};