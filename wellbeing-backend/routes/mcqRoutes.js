const express = require('express');
const router = express.Router();
const mcqController = require('../controllers/mcqController');

// Import Middlewares
const { protect } = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/roleMiddleware');

// Require authentication for ALL routes in this file
router.use(protect);

// ==========================================
// SCHOOL PANEL ROUTES (Teachers & Admins)
// ==========================================

// Submit the final assessment responses
router.post('/submit', allowRoles('teacher', 'school_admin', 'school_super_admin'), mcqController.submitResponses);

// Fetch questions (Allowed for everyone to read)
router.get('/', mcqController.getQuestions);
router.get('/:id', mcqController.getQuestion);

// ==========================================
// NGO ADMIN ROUTES (Managing Questions)
// ==========================================

router.post('/', allowRoles('ngo_super_admin'), mcqController.createQuestion);
router.put('/:id', allowRoles('ngo_super_admin'), mcqController.updateQuestion);
router.delete('/:id', allowRoles('ngo_super_admin'), mcqController.deleteQuestion);

module.exports = router;