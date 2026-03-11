const express = require('express');
const router = express.Router();
const mcqResponseController = require('../controllers/mcqResponseController');

// Import Middlewares
const { protect } = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/roleMiddleware');

// 1. Require authentication for ALL routes
router.use(protect);

// 2. Read operations (GET) allowed for ALL authenticated users
router.get('/', mcqResponseController.getResponses);
router.get('/:session_id', mcqResponseController.getResponsesBySession);

// 3. Write operations restricted to 'teacher' only
router.post('/', allowRoles('teacher','school_admin'), mcqResponseController.createResponses);

module.exports = router;