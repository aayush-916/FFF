const pool = require('../config/db');

exports.create = async (mcqData) => {
    const { lesson_id, question_text, options, correct_option, question_order } = mcqData;
    const query = `
        INSERT INTO mcq_questions (lesson_id, question_text, options, correct_option, question_order) 
        VALUES (?, ?, ?, ?, ?)
    `;
    
    // lesson_id is explicitly set to null if not provided
    const [result] = await pool.query(query, [
        lesson_id || null, 
        question_text, 
        options, 
        correct_option, 
        question_order || 0
    ]);
    return result.insertId;
};

exports.findAll = async (lessonId) => {
    let query = 'SELECT * FROM mcq_questions';
    const queryParams = [];

    if (lessonId) {
        // Fetch questions specific to this lesson OR global questions
        query += ' WHERE lesson_id = ? OR lesson_id IS NULL';
        queryParams.push(lessonId);
    }

    // Force global questions (lesson_id IS NULL) to the top, then sort by question_order
    query += `
        ORDER BY 
            CASE 
                WHEN lesson_id IS NULL THEN 0 
                ELSE 1 
            END ASC,
            question_order ASC
    `;
    
    const [rows] = await pool.query(query, queryParams);
    return rows;
};

exports.findById = async (id) => {
    const query = 'SELECT * FROM mcq_questions WHERE id = ?';
    const [rows] = await pool.query(query, [id]);
    return rows[0];
};

exports.update = async (id, mcqData) => {
    const fields = [];
    const values = [];
    const allowedFields = ['lesson_id', 'question_text', 'options', 'correct_option', 'question_order'];
    
    for (const key of allowedFields) {
        if (mcqData[key] !== undefined) {
            fields.push(`${key} = ?`);
            // lesson_id can be explicitly set to null to make a specific question global
            values.push(mcqData[key] === '' ? null : mcqData[key]); 
        }
    }

    if (fields.length === 0) return 0;

    const query = `UPDATE mcq_questions SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    const [result] = await pool.query(query, values);
    return result.affectedRows;
};

exports.delete = async (id) => {
    const query = 'DELETE FROM mcq_questions WHERE id = ?';
    const [result] = await pool.query(query, [id]);
    return result.affectedRows;
};