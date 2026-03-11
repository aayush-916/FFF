const schoolModel = require('../models/schoolModel');
const clusterModel = require('../models/clusterModel'); // Needed for validation

exports.createSchool = async (data) => {
    // 1. Basic validation
    if (!data.cluster_id || !data.name || !data.code) {
        throw new Error('BAD_REQUEST: cluster_id, name, and code are required');
    }

    // 2. Validate that the cluster exists
    const clusterExists = await clusterModel.findById(data.cluster_id);
    if (!clusterExists) {
        throw new Error('BAD_REQUEST: Invalid cluster_id. The specified cluster does not exist.');
    }

    // 3. Create the school
    const insertId = await schoolModel.create(data);
    return { id: insertId, ...data };
};

exports.getAllSchools = async () => {
    return await schoolModel.findAll();
};

exports.getSchoolById = async (id) => {
    const school = await schoolModel.findById(id);
    if (!school) {
        throw new Error('NOT_FOUND: School not found');
    }
    return school;
};

exports.updateSchool = async (id, data) => {
    // 1. Basic validation
    if (!data.cluster_id || !data.name || !data.code) {
        throw new Error('BAD_REQUEST: cluster_id, name, and code are required for update');
    }

    // 2. Validate that the cluster exists
    const clusterExists = await clusterModel.findById(data.cluster_id);
    if (!clusterExists) {
        throw new Error('BAD_REQUEST: Invalid cluster_id. The specified cluster does not exist.');
    }

    // 3. Update the school
    const affectedRows = await schoolModel.update(id, data);
    if (affectedRows === 0) {
        throw new Error('NOT_FOUND: School not found or no changes made');
    }
    
    return { id, ...data };
};

exports.deleteSchool = async (id) => {
    const affectedRows = await schoolModel.delete(id);
    if (affectedRows === 0) {
        throw new Error('NOT_FOUND: School not found');
    }
    return true;
};

exports.setupSchoolClasses = async (schoolId, classesData) => {
    if (!Array.isArray(classesData) || classesData.length === 0) {
        throw new Error('BAD_REQUEST: Invalid classes payload format');
    }
    await schoolModel.setupClasses(schoolId, classesData);
    return { message: 'School classes setup successfully' };
};