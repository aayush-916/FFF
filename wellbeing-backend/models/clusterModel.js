const pool = require('../config/db');

// Create a new cluster
exports.create = async (name) => {
    const query = 'INSERT INTO clusters (name) VALUES (?)';
    const [result] = await pool.query(query, [name]);
    return result.insertId;
};

// Get all clusters
exports.findAll = async () => {
    const query = 'SELECT * FROM clusters ORDER BY created_at DESC';
    const [rows] = await pool.query(query);
    return rows;
};

// Get a single cluster by ID
exports.findById = async (id) => {
    const query = 'SELECT * FROM clusters WHERE id = ?';
    const [rows] = await pool.query(query, [id]);
    return rows[0]; // Return the first matching record
};

// Update a cluster
exports.update = async (id, name) => {
    const query = 'UPDATE clusters SET name = ? WHERE id = ?';
    const [result] = await pool.query(query, [name, id]);
    return result.affectedRows;
};

// Delete a cluster
exports.delete = async (id) => {
    const query = 'DELETE FROM clusters WHERE id = ?';
    const [result] = await pool.query(query, [id]);
    return result.affectedRows;
};