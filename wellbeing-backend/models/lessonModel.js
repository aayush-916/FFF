const pool = require('../config/db');

exports.create = async (lessonData) => {
    const { habit_id, title, class_number, duration_minutes, lesson_pdf_url, teacher_guide_url } = lessonData;
    const query = `
        INSERT INTO lessons (habit_id, title, class_number, duration_minutes, lesson_pdf_url, teacher_guide_url) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
        habit_id, title, class_number, duration_minutes || 10, lesson_pdf_url || null, teacher_guide_url || null
    ]);
    return result.insertId;
};

exports.findAll = async (filters) => {
    let query = `
        SELECT l.*, h.name as habit_name 
        FROM lessons l
        LEFT JOIN habits h ON l.habit_id = h.id
        WHERE 1=1
    `;
    const queryParams = [];

    if (filters.habit_id) {
        query += ' AND l.habit_id = ?';
        queryParams.push(filters.habit_id);
    }
    
    if (filters.class_number) {
        query += ' AND l.class_number = ?';
        queryParams.push(filters.class_number);
    }

    query += ' ORDER BY l.class_number ASC, l.created_at DESC';
    
    const [rows] = await pool.query(query, queryParams);
    return rows;
};

exports.findById = async (id) => {
    const query = `
        SELECT l.*, h.name as habit_name 
        FROM lessons l
        LEFT JOIN habits h ON l.habit_id = h.id
        WHERE l.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    return rows[0];
};

exports.update = async (id, lessonData) => {
    // Dynamically build the update query so we don't overwrite files if no new ones are uploaded
    const fields = [];
    const values = [];
    const allowedFields = ['habit_id', 'title', 'class_number', 'duration_minutes', 'lesson_pdf_url', 'teacher_guide_url'];
    
    for (const key of allowedFields) {
        if (lessonData[key] !== undefined) {
            fields.push(`${key} = ?`);
            values.push(lessonData[key]);
        }
    }

    if (fields.length === 0) return 0;

    const query = `UPDATE lessons SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    const [result] = await pool.query(query, values);
    return result.affectedRows;
};

exports.delete = async (id) => {
    const query = 'DELETE FROM lessons WHERE id = ?';
    const [result] = await pool.query(query, [id]);
    return result.affectedRows;
};