const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');

// Import Middlewares
const { protect } = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/roleMiddleware');

// 1. Require authentication for ALL routes
router.use(protect);

// 2. Read operations (GET) allowed for ALL authenticated users
router.get('/', habitController.getHabits);
router.get('/:id', habitController.getHabit);

// 3. Write operations restricted to 'ngo_super_admin' only
router.post('/', allowRoles('ngo_super_admin'), habitController.createHabit);
router.put('/:id', allowRoles('ngo_super_admin'), habitController.updateHabit);
router.delete('/:id', allowRoles('ngo_super_admin'), habitController.deleteHabit);

module.exports = router;