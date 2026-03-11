const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

const { protect } = require('../middlewares/authMiddleware'); // Equivalent to verifyToken
const { allowRoles } = require('../middlewares/roleMiddleware');

router.use(protect);

// NGO Dashboard
router.get('/ngo', allowRoles('ngo_super_admin'), dashboardController.getNgoDashboard);

// School Dashboard (Accessible by School Super Admin & School Admin)
router.get(
    '/school', 
    allowRoles('school_super_admin', 'school_admin'), 
    dashboardController.getSchoolDashboard
);

// Teacher Dashboard (Accessible by School Admin & Teacher)
router.get(
    '/teacher', 
    allowRoles('school_admin', 'teacher'), 
    dashboardController.getTeacherDashboard
);

module.exports = router;