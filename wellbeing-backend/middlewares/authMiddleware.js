const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
    // Read the token from the HttpOnly cookie
    const token = req.cookies.token;

    // Make sure token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route. No token provided.'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the decoded payload to the request object
        req.user = decoded;

        next();
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route. Token is invalid or expired.'
        });
    }
};