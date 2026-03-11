const habitModel = require('../models/habitModel');
const domainModel = require('../models/domainModel'); // Required to validate domain existence

exports.createHabit = async (data) => {
    // 1. Basic validation
    if (!data.domain_id || !data.name) {
        throw new Error('BAD_REQUEST: domain_id and name are required');
    }

    // 2. Validate that the domain exists
    const domainExists = await domainModel.findById(data.domain_id);
    if (!domainExists) {
        throw new Error('BAD_REQUEST: Invalid domain_id. The specified domain does not exist.');
    }

    // 3. Create the habit
    const insertId = await habitModel.create(data);
    return { id: insertId, ...data };
};

exports.getAllHabits = async (domainId) => {
    return await habitModel.findAll(domainId);
};

exports.getHabitById = async (id) => {
    const habit = await habitModel.findById(id);
    if (!habit) {
        throw new Error('NOT_FOUND: Habit not found');
    }
    return habit;
};

exports.updateHabit = async (id, data) => {
    // 1. Basic validation
    if (!data.domain_id || !data.name) {
        throw new Error('BAD_REQUEST: domain_id and name are required for update');
    }

    // 2. Validate that the domain exists
    const domainExists = await domainModel.findById(data.domain_id);
    if (!domainExists) {
        throw new Error('BAD_REQUEST: Invalid domain_id. The specified domain does not exist.');
    }

    // 3. Update the habit
    const affectedRows = await habitModel.update(id, data);
    if (affectedRows === 0) {
        throw new Error('NOT_FOUND: Habit not found or no changes made');
    }
    
    return { id, ...data };
};

exports.deleteHabit = async (id) => {
    const affectedRows = await habitModel.delete(id);
    if (affectedRows === 0) {
        throw new Error('NOT_FOUND: Habit not found');
    }
    return true;
};