const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { protect } = require('../middlewares/authMiddleware'); // Your verifyToken
const { allowRoles } = require('../middlewares/roleMiddleware');

router.get(
    '/', 
    protect, 
    allowRoles('school_super_admin', 'school_admin'), 
    teacherController.getAllTeachers
);

// New POST route
router.post(
    '/', 
    protect, 
    allowRoles('school_super_admin', 'school_admin'), 
    teacherController.createTeacher
);

router.put(
    '/:id/classes', 
    protect, 
    allowRoles('school_super_admin', 'school_admin'), 
    teacherController.updateClasses
);

module.exports = router;