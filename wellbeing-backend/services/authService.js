const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authModel = require('../models/authModel');

exports.login = async (username, password) => {
    // 1. Validate input
    if (!username || !password) {
        throw new Error('BAD_REQUEST: Please provide both username and password');
    }

    // 2. Check if user exists
    const user = await authModel.findByUsername(username);
    if (!user) {
        throw new Error('UNAUTHORIZED: Invalid credentials');
    }

    // 3. Check if account is active
    if (user.status !== 'active') {
        throw new Error('UNAUTHORIZED: Your account has been disabled. Please contact the administrator.');
    }

    // 4. Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw new Error('UNAUTHORIZED: Invalid credentials');
    }

    // 5. Generate JWT Payload
    const payload = {
        user_id: user.id,
        school_id: user.school_id,
        role: user.role // 👈 Make sure role is in the JWT payload
    };

    // 6. Sign Token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });

    // 7. Update last login time asynchronously (no need to await it to block the login)
    authModel.updateLastLogin(user.id).catch(err => console.error('Failed to update last login:', err));

    // 8. Remove password hash from the user object before returning
    const { password_hash, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
};

exports.getMe = async (userId) => {
    const user = await authModel.findById(userId);
    if (!user) {
        throw new Error('NOT_FOUND: User not found');
    }
    return user;
};