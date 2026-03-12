const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const { protect } = require('../middlewares/authMiddleware');
// We only need your actual middleware function: allowRoles
const { allowRoles } = require('../middlewares/roleMiddleware'); 

router.post('/', userController.createUser);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// Your existing promote route
router.put('/:id/promote-admin', protect, allowRoles('ngo_super_admin', 'school_super_admin',"school_admin"), userController.promoteToAdmin);

// The NEW demote route, using the correct allowRoles function!
router.put('/:id/demote', protect, allowRoles('ngo_super_admin', 'school_super_admin', 'school_admin'), userController.demoteUser);

module.exports = router;