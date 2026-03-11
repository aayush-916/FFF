const pool = require('../config/db');

// Create a new domain
exports.create = async (name) => {
    const query = 'INSERT INTO domains (name) VALUES (?)';
    const [result] = await pool.query(query, [name]);
    return result.insertId;
};

// Get all domains
exports.findAll = async () => {
    const query = 'SELECT * FROM domains ORDER BY id ASC';
    const [rows] = await pool.query(query);
    return rows;
};

// Get a single domain by ID
exports.findById = async (id) => {
    const query = 'SELECT * FROM domains WHERE id = ?';
    const [rows] = await pool.query(query, [id]);
    return rows[0];
};

// Update a domain
exports.update = async (id, name) => {
    const query = 'UPDATE domains SET name = ? WHERE id = ?';
    const [result] = await pool.query(query, [name, id]);
    return result.affectedRows;
};

// Delete a domain
exports.delete = async (id) => {
    const query = 'DELETE FROM domains WHERE id = ?';
    const [result] = await pool.query(query, [id]);
    return result.affectedRows;
};