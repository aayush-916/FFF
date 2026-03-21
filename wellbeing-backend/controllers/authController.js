const authService = require('../services/authService');
const bcrypt = require('bcrypt'); // Needed for the new password change endpoint
const pool = require('../config/db'); // Needed to update the database directly

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
    secure: true,
    sameSite: 'none',
    domain: '.aanyasolutions.com', // 🔥 IMPORTANT (add this back)
    path: '/',
    maxAge: 365 * 24 * 60 * 60 * 1000
});

        // Return the user data (without the token) AND the force_password_change flag
        res.status(200).json({
            success: true,
            force_password_change: result.user.force_password_change === 1 || result.user.force_password_change === true,
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

// ==========================================
// FIRST TIME LOGIN LOGIC
// ==========================================

// @desc    Change password on first login
// @route   POST /api/v1/auth/first-password-change
// @access  Private (Requires valid HttpOnly token cookie)
exports.firstPasswordChange = async (req, res) => {
    try {
        const { new_password } = req.body;
        
        // Based on your getMe function, your protect middleware uses user_id
        const userId = req.user.user_id || req.user.id; 

        if (!new_password || new_password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
        }

        // Hash the new password securely
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update the password and clear the forced change flag
        const query = `UPDATE users SET password_hash = ?, force_password_change = false WHERE id = ?`;
        await pool.query(query, [hashedPassword, userId]);

        res.status(200).json({
            success: true,
            message: "Password updated successfully. You can now access your dashboard."
        });

    } catch (error) {
        console.error("Password change error:", error);
        res.status(500).json({ success: false, message: "Server error updating password." });
    }
};
