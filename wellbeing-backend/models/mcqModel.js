const pool = require('../config/db');

exports.findAll = async () => {
    const [rows] = await pool.query('SELECT * FROM mcq_questions ORDER BY question_order ASC');
    return rows;
};

exports.findById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM mcq_questions WHERE id = ?', [id]);
    return rows[0];
};

exports.createQuestion = async (data) => {
    const query = `
        INSERT INTO mcq_questions 
        (lesson_id, question_type, is_optional, question_text, options, correct_option, question_order) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Ensure options is stringified JSON, even if it's an empty array
    const optionsJson = data.options ? JSON.stringify(data.options) : JSON.stringify([]);

    const [result] = await pool.query(query, [
        data.lesson_id || null,
        data.question_type || 'mcq',
        data.is_optional ? 1 : 0,
        data.question_text,
        optionsJson,
        data.correct_option || null,
        data.question_order || 0
    ]);
    return result.insertId;
};

exports.updateQuestion = async (id, data) => {
    const query = `
        UPDATE mcq_questions 
        SET lesson_id = ?, question_type = ?, is_optional = ?, question_text = ?, 
            options = ?, correct_option = ?, question_order = ?
        WHERE id = ?
    `;
    
    const optionsJson = data.options ? JSON.stringify(data.options) : JSON.stringify([]);

    const [result] = await pool.query(query, [
        data.lesson_id || null,
        data.question_type || 'mcq',
        data.is_optional ? 1 : 0,
        data.question_text,
        optionsJson,
        data.correct_option || null,
        data.question_order || 0,
        id
    ]);
    return result.affectedRows;
};

exports.deleteQuestion = async (id) => {
    const [result] = await pool.query('DELETE FROM mcq_questions WHERE id = ?', [id]);
    return result.affectedRows;
};

// --- SCHOOL PANEL FUNCTIONS ---

exports.saveResponses = async (sessionId, responses) => {
    if (!responses || responses.length === 0) return;

    // Map the incoming array into a nested array for a bulk SQL insert
    const values = responses.map(r => [
        sessionId,
        r.question_id,
        r.selected_option || null, // Will be null for text questions
        r.text_answer || null      // Will be null for mcq questions
    ]);

    const query = `INSERT INTO mcq_responses (session_id, question_id, selected_option, text_answer) VALUES ?`;
    await pool.query(query, [values]);
};