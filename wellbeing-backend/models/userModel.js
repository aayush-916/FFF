const pool = require('../config/db');

exports.create = async (userData) => {
    const { school_id, name, username, password_hash, role, status, classes } = userData;
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // 1. Insert user
        const userQuery = 'INSERT INTO users (school_id, name, username, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)';
        const [userResult] = await connection.query(userQuery, [school_id || null, name, username, password_hash, role, status || 'active']);
        const userId = userResult.insertId;

        // 2. Insert teacher_classes using lookups from school_classes
        if ((role === 'teacher' || role === 'school_admin') && classes && classes.length > 0) {
            const classValues = [];
            for (const c of classes) {
                // Find the school_classes ID for this specific grade and section
                const [classRows] = await connection.query(
                    'SELECT id FROM school_classes WHERE school_id = ? AND class_number = ? AND section = ?',
                    [school_id, c.class_number, c.section]
                );
                
                if (classRows.length > 0) {
                    classValues.push([userId, classRows[0].id]);
                }
            }

            if (classValues.length > 0) {
                await connection.query('INSERT INTO teacher_classes (teacher_id, class_id) VALUES ?', [classValues]);
            }
        }

        await connection.commit();
        return userId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

exports.promoteToAdmin = async (userId) => {
    const query = `UPDATE users SET role = 'school_admin' WHERE id = ? AND role = 'teacher'`;
    const [result] = await pool.query(query, [userId]);
    return result.affectedRows;
};

exports.findAll = async () => {
    // Subquery uses JSON_ARRAYAGG to return classes as a clean array of objects
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
        ORDER BY u.created_at DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
};

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

exports.update = async (id, userData) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // 1. Update standard user fields dynamically
        const fields = [];
        const values = [];
        const allowedFields = ['school_id', 'name', 'username', 'role', 'status'];
        
        for (const key of allowedFields) {
            if (userData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(userData[key]);
            }
        }

        if (fields.length > 0) {
            const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
            values.push(id);
            await connection.query(query, values);
        }

        // 2. Sync classes if provided (BUG FIXED HERE!)
        if ((userData.role === 'teacher' || userData.role === 'school_admin') && userData.classes !== undefined) {
            
            // Get the school_id to look up the correct classes
            let currentSchoolId = userData.school_id;
            if (!currentSchoolId) {
                const [userRows] = await connection.query('SELECT school_id FROM users WHERE id = ?', [id]);
                if (userRows.length > 0) currentSchoolId = userRows[0].school_id;
            }

            // Wipe existing classes for this teacher
            await connection.query('DELETE FROM teacher_classes WHERE teacher_id = ?', [id]);
            
            // Insert the fresh array of classes using class_id lookups
            if (userData.classes.length > 0 && currentSchoolId) {
                const classValues = [];
                for (const c of userData.classes) {
                    const [classRows] = await connection.query(
                        'SELECT id FROM school_classes WHERE school_id = ? AND class_number = ? AND section = ?',
                        [currentSchoolId, c.class_number, c.section]
                    );
                    
                    if (classRows.length > 0) {
                        classValues.push([id, classRows[0].id]);
                    }
                }

                if (classValues.length > 0) {
                    await connection.query('INSERT INTO teacher_classes (teacher_id, class_id) VALUES ?', [classValues]);
                }
            }
        }

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

exports.delete = async (id) => {
    // teacher_classes will be automatically deleted due to ON DELETE CASCADE
    const query = 'DELETE FROM users WHERE id = ?';
    const [result] = await pool.query(query, [id]);
    return result.affectedRows;
};

// Add a helper for the Session Validation
exports.getTeacherClasses = async (teacherId) => {
    const query = `
        SELECT sc.class_number, sc.section 
        FROM teacher_classes tc
        JOIN school_classes sc ON tc.class_id = sc.id
        WHERE tc.teacher_id = ?
    `;
    const [rows] = await pool.query(query, [teacherId]);
    return rows;
};