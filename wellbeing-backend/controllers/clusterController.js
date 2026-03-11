const clusterService = require('../services/clusterService');

// Helper function to handle common service errors
const handleError = (res, error) => {
    console.error('Cluster API Error:', error.message);
    if (error.message.includes('NOT_FOUND')) {
        return res.status(404).json({ success: false, message: error.message.replace('NOT_FOUND: ', '') });
    }
    if (error.message.includes('BAD_REQUEST')) {
        return res.status(400).json({ success: false, message: error.message.replace('BAD_REQUEST: ', '') });
    }
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'A cluster with this name already exists' });
    }
    res.status(500).json({ success: false, message: 'Internal Server Error' });
};

// @desc    Create new cluster
// @route   POST /api/clusters
exports.createCluster = async (req, res) => {
    try {
        const newCluster = await clusterService.createCluster(req.body);
        res.status(201).json({ success: true, data: newCluster });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get all clusters
// @route   GET /api/clusters
exports.getClusters = async (req, res) => {
    try {
        const clusters = await clusterService.getAllClusters();
        res.status(200).json({ success: true, count: clusters.length, data: clusters });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get single cluster
// @route   GET /api/clusters/:id
exports.getCluster = async (req, res) => {
    try {
        const cluster = await clusterService.getClusterById(req.params.id);
        res.status(200).json({ success: true, data: cluster });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Update cluster
// @route   PUT /api/clusters/:id
exports.updateCluster = async (req, res) => {
    try {
        const updatedCluster = await clusterService.updateCluster(req.params.id, req.body);
        res.status(200).json({ success: true, data: updatedCluster });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Delete cluster
// @route   DELETE /api/clusters/:id
exports.deleteCluster = async (req, res) => {
    try {
        await clusterService.deleteCluster(req.params.id);
        res.status(200).json({ success: true, message: 'Cluster deleted successfully' });
    } catch (error) {
        handleError(res, error);
    }
};