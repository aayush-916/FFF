const pool = require('../config/db');

exports.create = async (sessionData) => {
    const { school_id, teacher_id, habit_id, lesson_id, class_number, section } = sessionData;
    const query = `
        INSERT INTO session_feedback 
        (school_id, teacher_id, habit_id, lesson_id, class_number, section) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
        school_id, teacher_id, habit_id, lesson_id, class_number, section
    ]);
    return result.insertId;
};

exports.findAll = async (filters) => {
    let query = `
        SELECT sf.id, sf.school_id, sf.teacher_id, sf.habit_id, sf.class_number, 
               sf.section, sf.conducted_at as created_at, sf.lesson_id,
               s.name as school_name, u.name as teacher_name, 
               h.name as habit_name, h.name as lesson_title 
        FROM session_feedback sf
        LEFT JOIN schools s ON sf.school_id = s.id
        LEFT JOIN users u ON sf.teacher_id = u.id
        LEFT JOIN habits h ON sf.habit_id = h.id
        LEFT JOIN lessons l ON sf.lesson_id = l.id
        WHERE 1=1
    `;
    const queryParams = [];

    // Apply optional filters
    if (filters.school_id) {
        query += ' AND sf.school_id = ?';
        queryParams.push(filters.school_id);
    }
    if (filters.teacher_id) {
        query += ' AND sf.teacher_id = ?';
        queryParams.push(filters.teacher_id);
    }
    if (filters.habit_id) {
        query += ' AND sf.habit_id = ?';
        queryParams.push(filters.habit_id);
    }

    query += ' ORDER BY sf.conducted_at DESC';
    
    const [rows] = await pool.query(query, queryParams);
    return rows;
};

exports.findById = async (id) => {
    const query = `
        SELECT sf.id, sf.school_id, sf.teacher_id, sf.habit_id, sf.class_number, 
               sf.section, sf.conducted_at as created_at, sf.lesson_id,
               s.name as school_name, u.name as teacher_name, 
               h.name as habit_name, h.name as lesson_title 
        FROM session_feedback sf
        LEFT JOIN schools s ON sf.school_id = s.id
        LEFT JOIN users u ON sf.teacher_id = u.id
        LEFT JOIN habits h ON sf.habit_id = h.id
        LEFT JOIN lessons l ON sf.lesson_id = l.id
        WHERE sf.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    return rows[0];
};

// Add this new function to models/sessionModel.js
exports.markMaterialComplete = async (data) => {
    // 1. Securely fetch the school_id directly from the teacher's profile
    const [teacherRecord] = await pool.query(`SELECT school_id FROM users WHERE id = ?`, [data.teacher_id]);
    
    if (teacherRecord.length === 0) {
        throw new Error("Teacher not found");
    }
    const secureSchoolId = teacherRecord[0].school_id;

    // 2. Prevent duplicate clicks
    const checkQuery = `
        SELECT id FROM session_feedback 
        WHERE teacher_id = ? AND material_id = ? AND class_number = ? AND section = ?
    `;
    const [existing] = await pool.query(checkQuery, [
        data.teacher_id, data.material_id, data.class_number, data.section
    ]);

    if (existing.length > 0) {
        return { alreadyCompleted: true, id: existing[0].id };
    }

    // 3. Insert the new completion record using the secureSchoolId
    const query = `
        INSERT INTO session_feedback 
        (school_id, teacher_id, habit_id, lesson_id, material_id, class_number, section) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [
        secureSchoolId, // 👈 Look ma, no frontend data needed!
        data.teacher_id,
        data.habit_id,
        data.parent_lesson_id, 
        data.material_id,
        data.class_number,
        data.section
    ]);
    
    return { alreadyCompleted: false, id: result.insertId };
};