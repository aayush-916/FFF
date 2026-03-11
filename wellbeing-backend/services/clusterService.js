const clusterModel = require('../models/clusterModel');

exports.createCluster = async (data) => {
    if (!data.name) {
        throw new Error('BAD_REQUEST: Cluster name is required');
    }
    
    // The database will throw an error if the name already exists due to the UNIQUE constraint
    const insertId = await clusterModel.create(data.name);
    return { id: insertId, name: data.name };
};

exports.getAllClusters = async () => {
    return await clusterModel.findAll();
};

exports.getClusterById = async (id) => {
    const cluster = await clusterModel.findById(id);
    if (!cluster) {
        throw new Error('NOT_FOUND: Cluster not found');
    }
    return cluster;
};

exports.updateCluster = async (id, data) => {
    if (!data.name) {
        throw new Error('BAD_REQUEST: Cluster name is required for update');
    }

    const affectedRows = await clusterModel.update(id, data.name);
    if (affectedRows === 0) {
        throw new Error('NOT_FOUND: Cluster not found or no changes made');
    }
    
    return { id, name: data.name };
};

exports.deleteCluster = async (id) => {
    const affectedRows = await clusterModel.delete(id);
    if (affectedRows === 0) {
        throw new Error('NOT_FOUND: Cluster not found');
    }
    return true;
};