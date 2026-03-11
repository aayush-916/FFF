// services/sessionService.js
const sessionModel = require('../models/sessionModel');
const habitModel = require('../models/habitModel');
const userModel = require('../models/userModel'); 

exports.createSession = async (data, currentUser) => {
    if (!data.habit_id || !data.lesson_id || !data.class_number || !data.section) {
        throw new Error('BAD_REQUEST: habit_id, lesson_id, class_number, and section are required');
    }

    if (!currentUser.school_id) {
        throw new Error('BAD_REQUEST: Teacher must be assigned to a school to create a session');
    }

    const habitExists = await habitModel.findById(data.habit_id);
    if (!habitExists) {
        throw new Error('BAD_REQUEST: Invalid habit_id. The specified habit does not exist.');
    }

    // SOFT CHECK: Verify if teacher is officially assigned to this class
    const assignedClasses = await userModel.getTeacherClasses(currentUser.user_id);
    const isAssigned = assignedClasses.some(
        c => c.class_number === data.class_number && c.section === data.section
    );

    const sessionData = {
        school_id: currentUser.school_id,
        teacher_id: currentUser.user_id,
        habit_id: data.habit_id,
        lesson_id: data.lesson_id,
        class_number: data.class_number,
        section: data.section
    };

    const insertId = await sessionModel.create(sessionData);
    
    return { 
        id: insertId, 
        ...sessionData, 
        note: isAssigned ? 'Standard assignment' : 'Taught outside of official assignment schedule' 
    };
};

// RESTORED FUNCTIONS BELOW
exports.getAllSessions = async (filters) => {
    return await sessionModel.findAll(filters);
};

exports.getSessionById = async (id) => {
    const session = await sessionModel.findById(id);
    if (!session) {
        throw new Error('NOT_FOUND: Session feedback not found');
    }
    return session;
};