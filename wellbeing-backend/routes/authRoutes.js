const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes (requires valid HttpOnly cookie)
router.get('/me', protect, authController.getMe);

module.exports = router;