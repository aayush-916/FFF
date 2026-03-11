// middlewares/roleMiddleware.js

const allowRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // Ensure req.user exists (meaning the protect middleware ran successfully)
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. User identity missing.'
            });
        }

        // Check if the user's role is in the list of allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: User role '${req.user.role}' is not authorized to perform this action.`
            });
        }

        // User is authorized, proceed to the controller
        next();
    };
};

module.exports = { allowRoles };