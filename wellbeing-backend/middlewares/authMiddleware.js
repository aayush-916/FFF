const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // Make sure your DB pool is imported!

exports.protect = async (req, res, next) => {
    let token;

    // 1. Grab the token from the HttpOnly cookie OR the Bearer header
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'UNAUTHORIZED: No token provided' });
    }

    try {
        // 2. Decode the token to get the user_id
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.user_id || decoded.id; // Support both naming conventions

        // 3. THE MAGIC: Fetch the FRESH user details directly from the database
        const query = 'SELECT id, role, school_id FROM users WHERE id = ? AND status = "active"';
        const [users] = await pool.query(query, [userId]);

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'UNAUTHORIZED: User no longer exists or account is disabled' 
            });
        }

        // 4. Attach the FRESH database user to the request object
        req.user = users[0];
        
        // Ensure we also map user_id for any controllers expecting it
        req.user.user_id = users[0].id; 

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        return res.status(401).json({ success: false, message: 'UNAUTHORIZED: Token failed or expired' });
    }
};