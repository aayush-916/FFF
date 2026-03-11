// models/authModel.js
const pool = require('../config/db');

exports.findByUsername = async (username) => {
    const query = 'SELECT * FROM users WHERE username = ?';
    const [rows] = await pool.query(query, [username]);
    return rows[0];
};

// Inside models/authModel.js

exports.findById = async (id) => {
    const query = `
        SELECT 
            u.id, u.school_id, u.name, u.username, u.role, u.status, u.last_login, u.created_at, 
            s.name as school_name,
            CASE 
                WHEN u.role IN ('teacher', 'school_admin') THEN
                    COALESCE(
                        (SELECT JSON_ARRAYAGG(JSON_OBJECT('class_number', sc.class_number, 'section', sc.section))
                         FROM teacher_classes tc 
                         JOIN school_classes sc ON tc.class_id = sc.id
                         WHERE tc.teacher_id = u.id), 
                        JSON_ARRAY()
                    )
                ELSE NULL
            END as classes
        FROM users u 
        LEFT JOIN schools s ON u.school_id = s.id 
        WHERE u.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    return rows[0];
};

exports.updateLastLogin = async (id) => {
    const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
    await pool.query(query, [id]);
};