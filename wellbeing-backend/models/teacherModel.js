const pool = require('../config/db');

// Replace the existing getTeachersBySchool function in models/teacherModel.js

exports.getTeachersBySchool = async (schoolId) => {
    const query = `
        SELECT 
            u.id, u.name, u.username, u.role,
            COALESCE(
                (SELECT JSON_ARRAYAGG(JSON_OBJECT('class_number', sc.class_number, 'section', sc.section))
                 FROM teacher_classes tc 
                 JOIN school_classes sc ON tc.class_id = sc.id
                 WHERE tc.teacher_id = u.id), 
                JSON_ARRAY()
            ) as classes
        FROM users u
        WHERE u.school_id = ? AND u.role IN ('teacher', 'school_admin')
        ORDER BY u.name ASC
    `;
    const [rows] = await pool.query(query, [schoolId]);
    
    // Safety check: Some MySQL drivers return JSON_ARRAYAGG as a string instead of an object.
    // This ensures it always goes to the frontend as a proper JavaScript Array.
    return rows.map(teacher => {
        let parsedClasses = [];
        try {
            parsedClasses = typeof teacher.classes === 'string' ? JSON.parse(teacher.classes) : teacher.classes;
        } catch (e) {
            console.error('Failed to parse classes JSON for teacher', teacher.id);
        }
        return {
            ...teacher,
            classes: parsedClasses || [] // Ensures it is always an array
        };
    });
};
// Add this below your existing getTeachersBySchool function in models/teacherModel.js

exports.createTeacher = async (schoolId, name, username, passwordHash, role, assignedClasses) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // 1. Insert the teacher into the users table
        const userQuery = `
            INSERT INTO users (school_id, name, username, password_hash, role, status)
            VALUES (?, ?, ?, ?, ?, 'active')
        `;
        // Default to 'teacher' if role isn't explicitly provided
        const [userResult] = await connection.query(userQuery, [
            schoolId, name, username, passwordHash, role || 'teacher'
        ]);
        
        const teacherId = userResult.insertId;

        // 2. Insert the assigned classes into the teacher_classes table
        if (assignedClasses && Array.isArray(assignedClasses) && assignedClasses.length > 0) {
            // Format array for bulk insert: [[teacher_id, class_id1], [teacher_id, class_id2]]
            const classValues = assignedClasses.map(classId => [teacherId, classId]);
            const classQuery = `INSERT INTO teacher_classes (teacher_id, class_id) VALUES ?`;
            
            await connection.query(classQuery, [classValues]);
        }

        await connection.commit();
        return teacherId;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Add this below your existing functions in models/teacherModel.js

exports.updateTeacherClasses = async (teacherId, schoolId, classes) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Security Check: Verify the teacher belongs to the admin's school
        const [teacherRows] = await connection.query(
            'SELECT id FROM users WHERE id = ? AND school_id = ?',
            [teacherId, schoolId]
        );
        
        if (teacherRows.length === 0) {
            throw new Error('NOT_FOUND: Teacher not found in your school');
        }

        // 2. Delete existing class associations for this teacher
        await connection.query('DELETE FROM teacher_classes WHERE teacher_id = ?', [teacherId]);

        // 3. Insert new class associations
        if (classes && Array.isArray(classes) && classes.length > 0) {
            const classValues = [];
            
            for (const c of classes) {
                // Lookup the actual class_id from the school_classes table
                const [scRows] = await connection.query(
                    'SELECT id FROM school_classes WHERE school_id = ? AND class_number = ? AND section = ?',
                    [schoolId, c.class_number, c.section]
                );
                
                if (scRows.length > 0) {
                    classValues.push([teacherId, scRows[0].id]);
                }
            }

            // Only run the insert if we found valid matching classes
            if (classValues.length > 0) {
                await connection.query(
                    'INSERT INTO teacher_classes (teacher_id, class_id) VALUES ?',
                    [classValues]
                );
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
