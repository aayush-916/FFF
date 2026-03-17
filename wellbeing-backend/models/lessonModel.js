const pool = require('../config/db');

// Helper function to format the flat SQL rows into nested JSON
const formatLessons = (rows) => {
    const lessonsMap = new Map();

    rows.forEach(row => {
        if (!lessonsMap.has(row.id)) {
            lessonsMap.set(row.id, {
                id: row.id,
                title: row.habit_title, // 👈 MAGIC: Sending the Habit Name as the Lesson Title!
                habit_id: row.habit_id,
                type: row.type,
                duration_minutes: row.duration_minutes,
                teacher_guide_url: row.teacher_guide_url,
                created_at: row.created_at,
                materials: []
            });
        }

        if (row.material_id) {
            lessonsMap.get(row.id).materials.push({
                id: row.material_id,
                title: row.material_title,
                description: row.material_desc,
                pdf_url: row.material_pdf
            });
        }
    });

    return Array.from(lessonsMap.values());
};

exports.findAll = async () => {
    // 👈 Added JOIN habits h ON l.habit_id = h.id to grab the habit name
    const query = `
        SELECT l.*, h.name AS habit_title,
               m.id AS material_id, m.title AS material_title, 
               m.description AS material_desc, m.pdf_url AS material_pdf
        FROM lessons l
        JOIN habits h ON l.habit_id = h.id
        LEFT JOIN lesson_materials m ON l.id = m.lesson_id
        ORDER BY l.created_at DESC
    `;
    const [rows] = await pool.query(query);
    return formatLessons(rows);
};

exports.findById = async (id) => {
    // 👈 Added JOIN habits h ON l.habit_id = h.id to grab the habit name
    const query = `
        SELECT l.*, h.name AS habit_title,
               m.id AS material_id, m.title AS material_title, 
               m.description AS material_desc, m.pdf_url AS material_pdf
        FROM lessons l
        JOIN habits h ON l.habit_id = h.id
        LEFT JOIN lesson_materials m ON l.id = m.lesson_id
        WHERE l.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    const formatted = formatLessons(rows);
    return formatted.length > 0 ? formatted[0] : null;
};

exports.createLessonTransaction = async (lessonData, materialsData) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Insert Lesson (No title)
        const lessonQuery = `INSERT INTO lessons (habit_id, type, duration_minutes, teacher_guide_url) VALUES (?, ?, ?, ?)`;
        const [lessonRes] = await connection.query(lessonQuery, [
            lessonData.habit_id, lessonData.type, lessonData.duration_minutes, lessonData.teacher_guide_url
        ]);
        const newLessonId = lessonRes.insertId;

        // 2. Insert Materials
        if (materialsData && materialsData.length > 0) {
            const materialQuery = `INSERT INTO lesson_materials (lesson_id, title, description, pdf_url) VALUES ?`;
            const materialValues = materialsData.map(m => [newLessonId, m.title, m.description, m.pdf_url]);
            await connection.query(materialQuery, [materialValues]);
        }

        await connection.commit();
        return newLessonId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

exports.updateLessonTransaction = async (id, lessonData, newMaterialsData, existingMaterialsToKeep) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Update basic lesson data (No title)
        const fields = [];
        const values = [];
        const allowedFields = ['habit_id', 'type', 'duration_minutes', 'teacher_guide_url'];
        
        for (const key of allowedFields) {
            if (lessonData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(lessonData[key]);
            }
        }

        if (fields.length > 0) {
            values.push(id);
            await connection.query(`UPDATE lessons SET ${fields.join(', ')} WHERE id = ?`, values);
        }

        // 2. Delete old materials
        if (existingMaterialsToKeep && existingMaterialsToKeep.length > 0) {
            await connection.query(`DELETE FROM lesson_materials WHERE lesson_id = ? AND id NOT IN (?)`, [id, existingMaterialsToKeep]);
        } else if (existingMaterialsToKeep !== undefined) {
            await connection.query(`DELETE FROM lesson_materials WHERE lesson_id = ?`, [id]);
        }

        // 3. Insert new materials
        if (newMaterialsData && newMaterialsData.length > 0) {
            const materialQuery = `INSERT INTO lesson_materials (lesson_id, title, description, pdf_url) VALUES ?`;
            const materialValues = newMaterialsData.map(m => [id, m.title, m.description, m.pdf_url]);
            await connection.query(materialQuery, [materialValues]);
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

exports.deleteLesson = async (id) => {
    const [result] = await pool.query('DELETE FROM lessons WHERE id = ?', [id]);
    return result.affectedRows;
};