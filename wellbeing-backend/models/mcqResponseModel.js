const pool = require('../config/db');

// Batch insert multiple responses
exports.createBatch = async (sessionId, responses) => {
    // Format data for MySQL bulk insert: [ [session_id, question_id, selected_option], [...] ]
    const values = responses.map(response => [
        sessionId,
        response.question_id,
        response.selected_option
    ]);

    const query = `
        INSERT INTO mcq_responses (session_id, question_id, selected_option) 
        VALUES ?
    `;
    
    // Note the extra array wrapper [values] required by mysql2 for bulk inserts
    const [result] = await pool.query(query, [values]);
    return result.affectedRows; // Returns the number of inserted rows
};

// Get all responses
exports.findAll = async () => {
    const query = `
        SELECT mr.id, mr.session_id, mr.question_id, mr.selected_option, 
               q.question_text, q.correct_option 
        FROM mcq_responses mr
        LEFT JOIN mcq_questions q ON mr.question_id = q.id
        ORDER BY mr.session_id DESC, mr.id ASC
    `;
    const [rows] = await pool.query(query);
    return rows;
};

// Get responses for a specific session
exports.findBySessionId = async (sessionId) => {
    const query = `
        SELECT mr.id, mr.session_id, mr.question_id, mr.selected_option, 
               q.question_text, q.correct_option 
        FROM mcq_responses mr
        LEFT JOIN mcq_questions q ON mr.question_id = q.id
        WHERE mr.session_id = ?
        ORDER BY mr.id ASC
    `;
    const [rows] = await pool.query(query, [sessionId]);
    return rows;
};