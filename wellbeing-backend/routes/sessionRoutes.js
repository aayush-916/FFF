const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// Import Middlewares
const { protect } = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/roleMiddleware');

// 1. Require authentication for ALL routes
router.use(protect);

// 2. Read operations (GET) allowed for ALL authenticated users (NGO admins, school admins, teachers)
router.get('/', sessionController.getSessions);
router.get('/:id', sessionController.getSession);

// 3. Write operations restricted to 'teacher' only
router.post(
    '/', 
    allowRoles('teacher', 'school_admin'), 
    sessionController.createSession
);

module.exports = router;