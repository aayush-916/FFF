const pool = require('../config/db');

exports.create = async (assessmentData) => {
    const { 
        school_id, phase, food_environment_score, daily_habits_score, 
        wellbeing_activities_score, teacher_engagement_score, family_partnership_score, 
        total_score, recognition_level, is_locked 
    } = assessmentData;

    const query = `
        INSERT INTO wellbeing_assessments 
        (school_id, phase, food_environment_score, daily_habits_score, wellbeing_activities_score, 
         teacher_engagement_score, family_partnership_score, total_score, recognition_level, is_locked) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [
        school_id, phase, 
        food_environment_score || 0, 
        daily_habits_score || 0, 
        wellbeing_activities_score || 0, 
        teacher_engagement_score || 0, 
        family_partnership_score || 0, 
        total_score, 
        recognition_level, 
        is_locked
    ]);
    
    return result.insertId;
};

// 🔒 Use this ONLY for NGO Super Admins
exports.findAll = async () => {
    const query = `
        SELECT wa.*, s.name as school_name, s.code as school_code 
        FROM wellbeing_assessments wa
        LEFT JOIN schools s ON wa.school_id = s.id
        ORDER BY wa.submitted_at DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
};

// 🔒 Use this for the School Dashboard / Assessment Status
exports.findBySchoolId = async (schoolId) => {
    const query = `
        SELECT wa.*, s.name as school_name 
        FROM wellbeing_assessments wa
        LEFT JOIN schools s ON wa.school_id = s.id
        WHERE wa.school_id = ?
        ORDER BY wa.submitted_at DESC
    `;
    const [rows] = await pool.query(query, [schoolId]);
    return rows;
};

// 🔒 SECURED: Now accepts an optional schoolId to prevent cross-tenant viewing
exports.findById = async (id, schoolId = null) => {
    let query = 'SELECT * FROM wellbeing_assessments WHERE id = ?';
    const params = [id];

    // If a schoolId is provided, strictly lock the search to that school
    if (schoolId) {
        query += ' AND school_id = ?';
        params.push(schoolId);
    }

    const [rows] = await pool.query(query, params);
    return rows[0];
};

// 🔒 SECURED: Now accepts an optional schoolId to prevent cross-tenant overwriting
exports.update = async (id, assessmentData, schoolId = null) => {
    const fields = [];
    const values = [];
    
    const allowedFields = [
        'food_environment_score', 'daily_habits_score', 'wellbeing_activities_score', 
        'teacher_engagement_score', 'family_partnership_score', 'total_score', 
        'recognition_level', 'is_locked'
    ];
    
    for (const key of allowedFields) {
        if (assessmentData[key] !== undefined) {
            fields.push(`${key} = ?`);
            values.push(assessmentData[key]);
        }
    }

    if (fields.length === 0) return 0;

    let query = `UPDATE wellbeing_assessments SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    // If a schoolId is provided, strictly lock the update to that school
    if (schoolId) {
        query += ' AND school_id = ?';
        values.push(schoolId);
    }

    const [result] = await pool.query(query, values);
    return result.affectedRows;
};