const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const { protect } = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/roleMiddleware');

router.post('/', userController.createUser);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.put('/:id/promote-admin', protect, allowRoles('ngo_super_admin', 'school_super_admin'), userController.promoteToAdmin);

module.exports = router;