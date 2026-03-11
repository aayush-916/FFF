// routes/clusterRoutes.js

const express = require('express');
const router = express.Router();
const clusterController = require('../controllers/clusterController');

// Import Middlewares
const { protect } = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/roleMiddleware');

// 1. Require authentication for ALL routes in this file
router.use(protect);

// 2. Read operations (GET) allowed for ALL authenticated users
router.get('/', clusterController.getClusters);
router.get('/:id', clusterController.getCluster);

// 3. Write operations (POST, PUT, DELETE) restricted to 'ngo_super_admin' only
router.post('/', allowRoles('ngo_super_admin'), clusterController.createCluster);
router.put('/:id', allowRoles('ngo_super_admin'), clusterController.updateCluster);
router.delete('/:id', allowRoles('ngo_super_admin'), clusterController.deleteCluster);

module.exports = router;