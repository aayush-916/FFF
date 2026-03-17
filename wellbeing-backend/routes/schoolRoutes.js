// routes/schoolRoutes.js

const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');

// Import Middlewares
const { protect } = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/roleMiddleware');
const { uploadBulkFile } = require('../middlewares/uploadMiddleware');

// 1. Require authentication for ALL routes in this file
router.use(protect);

// ==========================================
// SPECIFIC/STATIC ROUTES (Must go before /:id)
// ==========================================

router.get(
    '/classes', 
    protect, 
    allowRoles('teacher', 'school_admin', 'school_super_admin'), 
    schoolController.getSchoolClasses
);

router.post(
    '/classes', 
    protect, 
    allowRoles('school_super_admin', 'school_admin'), 
    schoolController.addClass
);

router.delete(
    '/classes/:id', 
    protect, 
    allowRoles('school_super_admin', 'school_admin'), 
    schoolController.deleteClass
);

router.post(
    '/setup-classes', 
    protect, 
    allowRoles('school_super_admin'), 
    schoolController.setupClasses
);

// 👇 THIS IS THE FIXED BULK ROUTE 👇
router.post(
    '/bulk', 
    protect, 
    allowRoles('ngo_super_admin'), 
    uploadBulkFile, 
    schoolController.bulkUploadSchools
);

// ==========================================
// DYNAMIC ROUTES (Must go at the bottom)
// ==========================================

// Read operations (GET) allowed for ALL authenticated users
router.get('/', schoolController.getSchools);
router.get('/:id', schoolController.getSchool);

// Write operations (POST, PUT, DELETE) restricted to 'ngo_super_admin' only
router.post('/', allowRoles('ngo_super_admin'), schoolController.createSchool);
router.put('/:id', allowRoles('ngo_super_admin'), schoolController.updateSchool);
router.delete('/:id', allowRoles('ngo_super_admin'), schoolController.deleteSchool);

module.exports = router;