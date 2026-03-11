const lessonModel = require('../models/lessonModel');
const habitModel = require('../models/habitModel');

exports.createLesson = async (data) => {
    if (!data.habit_id || !data.title || !data.class_number) {
        throw new Error('BAD_REQUEST: habit_id, title, and class_number are required');
    }

    const habitExists = await habitModel.findById(data.habit_id);
    if (!habitExists) {
        throw new Error('BAD_REQUEST: Invalid habit_id. The specified habit does not exist.');
    }

    const insertId = await lessonModel.create(data);
    return { id: insertId, ...data };
};

exports.getAllLessons = async (filters) => {
    return await lessonModel.findAll(filters);
};

exports.getLessonById = async (id) => {
    const lesson = await lessonModel.findById(id);
    if (!lesson) {
        throw new Error('NOT_FOUND: Lesson not found');
    }
    return lesson;
};

exports.updateLesson = async (id, data) => {
    if (data.habit_id) {
        const habitExists = await habitModel.findById(data.habit_id);
        if (!habitExists) {
            throw new Error('BAD_REQUEST: Invalid habit_id. The specified habit does not exist.');
        }
    }

    const affectedRows = await lessonModel.update(id, data);
    if (affectedRows === 0) {
        throw new Error('NOT_FOUND: Lesson not found or no changes made');
    }
    
    return { id, message: 'Lesson updated successfully' };
};

exports.deleteLesson = async (id) => {
    const affectedRows = await lessonModel.delete(id);
    if (affectedRows === 0) {
        throw new Error('NOT_FOUND: Lesson not found');
    }
    return true;
};