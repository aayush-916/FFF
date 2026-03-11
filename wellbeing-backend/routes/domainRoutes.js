const express = require('express');
const router = express.Router();
const domainController = require('../controllers/domainController');

// Import Middlewares
const { protect } = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/roleMiddleware');

// 1. Require authentication for ALL routes in this file
router.use(protect);

// 2. Read operations (GET) allowed for ALL authenticated users
router.get('/', domainController.getDomains);
router.get('/:id', domainController.getDomain);

// 3. Write operations restricted to 'ngo_super_admin' only
router.post('/', allowRoles('ngo_super_admin'), domainController.createDomain);
router.put('/:id', allowRoles('ngo_super_admin'), domainController.updateDomain);
router.delete('/:id', allowRoles('ngo_super_admin'), domainController.deleteDomain);

module.exports = router;