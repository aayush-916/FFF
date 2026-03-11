const pool = require('../config/db');

// Create a new school
exports.create = async (schoolData) => {
    const { cluster_id, name, code, city, state, contact_person, contact_email, contact_phone, status } = schoolData;
    const query = `
        INSERT INTO schools 
        (cluster_id, name, code, city, state, contact_person, contact_email, contact_phone, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, 'active'))
    `;
    const [result] = await pool.query(query, [
        cluster_id, name, code, city, state, contact_person, contact_email, contact_phone, status
    ]);
    return result.insertId;
};

// Get all schools (with cluster name)
exports.findAll = async () => {
    const query = `
        SELECT s.*, c.name as cluster_name 
        FROM schools s 
        LEFT JOIN clusters c ON s.cluster_id = c.id 
        ORDER BY s.created_at DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
};

// Get a single school by ID (with cluster name)
exports.findById = async (id) => {
    const query = `
        SELECT s.*, c.name as cluster_name 
        FROM schools s 
        LEFT JOIN clusters c ON s.cluster_id = c.id 
        WHERE s.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    return rows[0];
};

// Update a school
exports.update = async (id, schoolData) => {
    const { cluster_id, name, code, city, state, contact_person, contact_email, contact_phone, status } = schoolData;
    const query = `
        UPDATE schools 
        SET cluster_id = ?, name = ?, code = ?, city = ?, state = ?, 
            contact_person = ?, contact_email = ?, contact_phone = ?, status = ?
        WHERE id = ?
    `;
    const [result] = await pool.query(query, [
        cluster_id, name, code, city, state, contact_person, contact_email, contact_phone, status, id
    ]);
    return result.affectedRows;
};

// Delete a school
exports.delete = async (id) => {
    const query = 'DELETE FROM schools WHERE id = ?';
    const [result] = await pool.query(query, [id]);
    return result.affectedRows;
};

exports.setupClasses = async (schoolId, classesData) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Flatten the payload: [{class_number: 1, sections: ['A', 'B']}] -> [[school_id, 1, 'A'], [school_id, 1, 'B']]
        const values = [];
        for (const cls of classesData) {
            for (const section of cls.sections) {
                values.push([schoolId, cls.class_number, section]);
            }
        }

        if (values.length > 0) {
            await connection.query(
                'INSERT INTO school_classes (school_id, class_number, section) VALUES ?', 
                [values]
            );
        }

        // Mark setup as completed
        await connection.query('UPDATE schools SET setup_completed = TRUE WHERE id = ?', [schoolId]);

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Add this below your existing functions in models/schoolModel.js

exports.getClassesBySchoolId = async (schoolId) => {
    const query = `
        SELECT id, class_number, section
        FROM school_classes
        WHERE school_id = ?
        ORDER BY class_number ASC, section ASC
    `;
    const [rows] = await pool.query(query, [schoolId]);
    return rows;
};

// Add these below your existing functions in models/schoolModel.js

// Replace addClass with this in models/schoolModel.js

exports.addClasses = async (schoolId, classesData) => {
    // Flatten the payload: 
    // From: { class_number: 5, sections: ['A', 'B'] }
    // To: [[school_id, 5, 'A'], [school_id, 5, 'B']]
    const values = [];
    
    for (const cls of classesData) {
        if (cls.sections && Array.isArray(cls.sections)) {
            for (const section of cls.sections) {
                values.push([schoolId, cls.class_number, section]);
            }
        }
    }

    // If there is nothing to insert, return 0
    if (values.length === 0) return 0;

    // INSERT IGNORE skips duplicates instead of throwing a fatal ER_DUP_ENTRY error
    const query = `INSERT IGNORE INTO school_classes (school_id, class_number, section) VALUES ?`;
    
    const [result] = await pool.query(query, [values]);
    
    // Returns the number of new rows actually created
    return result.affectedRows; 
};

exports.deleteClass = async (id, schoolId) => {
    const query = `DELETE FROM school_classes WHERE id = ? AND school_id = ?`;
    const [result] = await pool.query(query, [id, schoolId]);
    return result.affectedRows;
};