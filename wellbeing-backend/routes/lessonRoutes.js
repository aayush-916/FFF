const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');

// Import Middlewares
const { protect } = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/roleMiddleware');
const { uploadLessonFiles } = require('../middlewares/uploadMiddleware');

// 1. Require authentication for ALL routes
router.use(protect);

// 2. Read operations (GET) allowed for ALL authenticated users
router.get('/', lessonController.getLessons);
router.get('/:id', lessonController.getLesson);

// 3. Write operations restricted to 'ngo_super_admin' + handle file uploads
router.post('/', 
    allowRoles('ngo_super_admin'), 
    uploadLessonFiles, 
    lessonController.createLesson
);

router.put('/:id', 
    allowRoles('ngo_super_admin'), 
    uploadLessonFiles, 
    lessonController.updateLesson
);

router.delete('/:id', 
    allowRoles('ngo_super_admin'), 
    lessonController.deleteLesson
);

module.exports = router;