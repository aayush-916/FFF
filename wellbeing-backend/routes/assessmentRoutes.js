const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');

// Import Middlewares
const { protect } = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/roleMiddleware');

// 1. Require authentication for ALL routes
router.use(protect);

// 2. Read operations (GET) allowed for ALL authenticated users
router.get('/', assessmentController.getAssessments);
router.get('/:school_id', assessmentController.getAssessmentsBySchool);

// 3. Write operations restricted to 'school_admin' only
router.post('/', allowRoles('school_admin'), assessmentController.createAssessment);
router.put('/:id', allowRoles('school_admin'), assessmentController.updateAssessment);

router.get('/status', protect, assessmentController.getAssessmentStatus);

module.exports = router;