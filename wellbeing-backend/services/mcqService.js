const mcqModel = require('../models/mcqModel');
const lessonModel = require('../models/lessonModel'); // Needed to validate lesson existence

exports.createMcq = async (data) => {
    // 1. Basic validation
    if (!data.question_text || !data.options || !data.correct_option) {
        throw new Error('BAD_REQUEST: question_text, options, and correct_option are required');
    }

    if (!Array.isArray(data.options)) {
        throw new Error('BAD_REQUEST: options must be a valid JSON array');
    }

    // 2. Validate lesson existence (if lesson_id is provided)
    if (data.lesson_id) {
        const lessonExists = await lessonModel.findById(data.lesson_id);
        if (!lessonExists) {
            throw new Error('BAD_REQUEST: Invalid lesson_id. The specified lesson does not exist.');
        }
    }

    // 3. Stringify options for DB insertion
    const mcqData = {
        ...data,
        options: JSON.stringify(data.options)
    };

    const insertId = await mcqModel.create(mcqData);
    return { id: insertId, ...data };
};

exports.getAllMcqs = async (lessonId) => {
    const mcqs = await mcqModel.findAll(lessonId);
    
    // Ensure the JSON column is parsed back into an array if the DB driver returns a string
    return mcqs.map(mcq => ({
        ...mcq,
        options: typeof mcq.options === 'string' ? JSON.parse(mcq.options) : mcq.options
    }));
};

exports.getMcqById = async (id) => {
    const mcq = await mcqModel.findById(id);
    if (!mcq) {
        throw new Error('NOT_FOUND: MCQ Question not found');
    }
    
    mcq.options = typeof mcq.options === 'string' ? JSON.parse(mcq.options) : mcq.options;
    return mcq;
};

exports.updateMcq = async (id, data) => {
    // 1. Validate lesson existence if being updated
    if (data.lesson_id) {
        const lessonExists = await lessonModel.findById(data.lesson_id);
        if (!lessonExists) {
            throw new Error('BAD_REQUEST: Invalid lesson_id. The specified lesson does not exist.');
        }
    }

    // 2. Ensure options is an array and stringify it if it's being updated
    let updateData = { ...data };
    if (data.options) {
        if (!Array.isArray(data.options)) {
            throw new Error('BAD_REQUEST: options must be a valid JSON array');
        }
        updateData.options = JSON.stringify(data.options);
    }

    const affectedRows = await mcqModel.update(id, updateData);
    if (affectedRows === 0) {
        throw new Error('NOT_FOUND: MCQ Question not found or no changes made');
    }
    
    return { id, message: 'MCQ Question updated successfully' };
};

exports.deleteMcq = async (id) => {
    const affectedRows = await mcqModel.delete(id);
    if (affectedRows === 0) {
        throw new Error('NOT_FOUND: MCQ Question not found');
    }
    return true;
};