const domainModel = require('../models/domainModel');

exports.createDomain = async (data) => {
    if (!data.name) {
        throw new Error('BAD_REQUEST: Domain name is required');
    }
    
    const insertId = await domainModel.create(data.name);
    return { id: insertId, name: data.name };
};

exports.getAllDomains = async () => {
    return await domainModel.findAll();
};

exports.getDomainById = async (id) => {
    const domain = await domainModel.findById(id);
    if (!domain) {
        throw new Error('NOT_FOUND: Domain not found');
    }
    return domain;
};

exports.updateDomain = async (id, data) => {
    if (!data.name) {
        throw new Error('BAD_REQUEST: Domain name is required for update');
    }

    const affectedRows = await domainModel.update(id, data.name);
    if (affectedRows === 0) {
        throw new Error('NOT_FOUND: Domain not found or no changes made');
    }
    
    return { id, name: data.name };
};

exports.deleteDomain = async (id) => {
    const affectedRows = await domainModel.delete(id);
    if (affectedRows === 0) {
        throw new Error('NOT_FOUND: Domain not found');
    }
    return true;
};