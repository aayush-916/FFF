const express = require('express');
const router = express.Router();
const mcqController = require('../controllers/mcqController');

// Import Middlewares
const { protect } = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/roleMiddleware');

// 1. Require authentication for ALL routes
router.use(protect);

// 2. Read operations (GET) allowed for ALL authenticated users
router.get('/', mcqController.getMcqs);
router.get('/:id', mcqController.getMcq);

// 3. Write operations restricted to 'ngo_super_admin' only
router.post('/', allowRoles('ngo_super_admin'), mcqController.createMcq);
router.put('/:id', allowRoles('ngo_super_admin'), mcqController.updateMcq);
router.delete('/:id', allowRoles('ngo_super_admin'), mcqController.deleteMcq);

module.exports = router;