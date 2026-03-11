const assessmentModel = require('../models/assessmentModel');

// Helper to calculate total score and assign recognition level
const calculateMetrics = (data) => {
    const total_score = 
        (Number(data.food_environment_score) || 0) +
        (Number(data.daily_habits_score) || 0) +
        (Number(data.wellbeing_activities_score) || 0) +
        (Number(data.teacher_engagement_score) || 0) +
        (Number(data.family_partnership_score) || 0);

    let recognition_level = 'none';
    if (total_score >= 80) recognition_level = 'gold';
    else if (total_score >= 60) recognition_level = 'silver';
    else if (total_score >= 40) recognition_level = 'bronze';

    return { total_score, recognition_level };
};

exports.createAssessment = async (data, currentUser) => {
    // 1. Validate user has a school_id
    if (!currentUser.school_id) {
        throw new Error('BAD_REQUEST: You must be assigned to a school to submit an assessment.');
    }

    if (!data.phase || !['baseline', 'midline', 'endline'].includes(data.phase)) {
        throw new Error('BAD_REQUEST: A valid phase (baseline, midline, endline) is required.');
    }

    // 2. Calculate scores
    const { total_score, recognition_level } = calculateMetrics(data);

    // 3. Prepare payload (Default is_locked to true on submission unless specified as false for a draft)
    const assessmentData = {
        ...data,
        school_id: currentUser.school_id,
        total_score,
        recognition_level,
        is_locked: data.is_locked !== undefined ? data.is_locked : true
    };

    const insertId = await assessmentModel.create(assessmentData);
    return { id: insertId, ...assessmentData };
};

exports.getAllAssessments = async () => {
    return await assessmentModel.findAll();
};

exports.getAssessmentsBySchool = async (schoolId) => {
    return await assessmentModel.findBySchoolId(schoolId);
};

exports.updateAssessment = async (id, data, currentUser) => {
    const existing = await assessmentModel.findById(id);
    
    if (!existing) {
        throw new Error('NOT_FOUND: Assessment not found');
    }

    // 1. Security check: Ensure the school admin is updating their own school's assessment
    if (existing.school_id !== currentUser.school_id) {
        throw new Error('FORBIDDEN: You can only update assessments for your own school.');
    }

    // 2. Lock check: Prevent updates if already locked
    if (existing.is_locked) {
        throw new Error('BAD_REQUEST: This assessment is locked and cannot be edited.');
    }

    // 3. Merge existing data with new data to correctly calculate the new total
    const mergedData = { ...existing, ...data };
    const { total_score, recognition_level } = calculateMetrics(mergedData);

    const updateData = {
        ...data,
        total_score,
        recognition_level,
        is_locked: data.is_locked !== undefined ? data.is_locked : true
    };

    const affectedRows = await assessmentModel.update(id, updateData);
    if (affectedRows === 0) {
        throw new Error('NOT_FOUND: Assessment not found or no changes made');
    }
    
    return { id, message: 'Assessment updated successfully', total_score, recognition_level };
};