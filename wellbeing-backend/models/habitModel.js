const pool = require('../config/db');

// Create a new habit
exports.create = async (habitData) => {
    const { domain_id, name, description, order_number } = habitData;
    const query = `
        INSERT INTO habits (domain_id, name, description, order_number) 
        VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [domain_id, name, description, order_number || null]);
    return result.insertId;
};

// Get all habits (with optional domain_id filter and joined domain name)
exports.findAll = async (domainId = null) => {
    let query = `
        SELECT h.id, h.domain_id, h.name, h.description, h.order_number, d.name as domain_name 
        FROM habits h
        LEFT JOIN domains d ON h.domain_id = d.id
    `;
    const queryParams = [];

    if (domainId) {
        query += ' WHERE h.domain_id = ?';
        queryParams.push(domainId);
    }

    query += ' ORDER BY h.domain_id ASC, h.order_number ASC';
    
    const [rows] = await pool.query(query, queryParams);
    return rows;
};

// Get a single habit by ID
exports.findById = async (id) => {
    const query = `
        SELECT h.id, h.domain_id, h.name, h.description, h.order_number, d.name as domain_name 
        FROM habits h
        LEFT JOIN domains d ON h.domain_id = d.id
        WHERE h.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    return rows[0];
};

// Update a habit
exports.update = async (id, habitData) => {
    const { domain_id, name, description, order_number } = habitData;
    const query = `
        UPDATE habits 
        SET domain_id = ?, name = ?, description = ?, order_number = ? 
        WHERE id = ?
    `;
    const [result] = await pool.query(query, [domain_id, name, description, order_number || null, id]);
    return result.affectedRows;
};

// Delete a habit
exports.delete = async (id) => {
    const query = 'DELETE FROM habits WHERE id = ?';
    const [result] = await pool.query(query, [id]);
    return result.affectedRows;
};