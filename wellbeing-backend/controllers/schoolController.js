const schoolService = require('../services/schoolService');
const schoolModel = require('../models/schoolModel');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const bcrypt = require('bcrypt');
const pool = require('../config/db');

// Helper function to handle errors cleanly
const handleError = (res, error) => {
    console.error('School API Error:', error.message);
    
    if (error.message.includes('NOT_FOUND')) {
        return res.status(404).json({ success: false, message: error.message.replace('NOT_FOUND: ', '') });
    }
    if (error.message.includes('BAD_REQUEST')) {
        return res.status(400).json({ success: false, message: error.message.replace('BAD_REQUEST: ', '') });
    }
    // Handle Unique Constraint Violation for School Code
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'A school with this unique code already exists' });
    }
    
    res.status(500).json({ success: false, message: 'Internal Server Error' });
};

// @desc    Create a new school
// @route   POST /api/v1/schools
exports.createSchool = async (req, res) => {
    try {
        const newSchool = await schoolService.createSchool(req.body);
        res.status(201).json({ success: true, data: newSchool });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get all schools
// @route   GET /api/v1/schools
exports.getSchools = async (req, res) => {
    try {
        const schools = await schoolService.getAllSchools();
        res.status(200).json({ success: true, count: schools.length, data: schools });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get single school
// @route   GET /api/v1/schools/:id
exports.getSchool = async (req, res) => {
    try {
        const school = await schoolService.getSchoolById(req.params.id);
        res.status(200).json({ success: true, data: school });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Update school
// @route   PUT /api/v1/schools/:id
exports.updateSchool = async (req, res) => {
    try {
        const updatedSchool = await schoolService.updateSchool(req.params.id, req.body);
        res.status(200).json({ success: true, data: updatedSchool });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Delete school
// @route   DELETE /api/v1/schools/:id
exports.deleteSchool = async (req, res) => {
    try {
        await schoolService.deleteSchool(req.params.id);
        res.status(200).json({ success: true, message: 'School deleted successfully' });
    } catch (error) {
        handleError(res, error);
    }
};

exports.setupClasses = async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        if (!schoolId) throw new Error('BAD_REQUEST: User is not assigned to a school');

        const result = await schoolService.setupSchoolClasses(schoolId, req.body);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        handleError(res, error); 
    }
};

// @desc    Get all classes for the logged-in user's school
// @route   GET /api/v1/schools/classes
// @access  Private (teacher, school_admin, school_super_admin)
exports.getSchoolClasses = async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        if (!schoolId) {
            return res.status(400).json({ 
                success: false, 
                message: 'BAD_REQUEST: User is not associated with a school.' 
            });
        }

        const classes = await schoolModel.getClassesBySchoolId(schoolId);

        res.status(200).json({
            success: true,
            data: classes
        });
    } catch (error) {
        console.error('School Classes API Error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch school classes' 
        });
    }
};

// @desc    Add multiple classes to the school
// @route   POST /api/v1/school/classes
// @access  Private (school_super_admin, school_admin)
exports.addClass = async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const { classes } = req.body;

        // Validate the new payload structure
        if (!classes || !Array.isArray(classes) || classes.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'A valid classes array is required' 
            });
        }

        const addedCount = await schoolModel.addClasses(schoolId, classes);

        // Provide a smart response based on how many were actually added
        if (addedCount === 0) {
            return res.status(409).json({ 
                success: false, 
                message: 'All of these classes and sections already exist in your school.' 
            });
        }

        res.status(201).json({ 
            success: true, 
            message: `Successfully added ${addedCount} new class section(s)!` 
        });

    } catch (error) {
        console.error('Add Classes Error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to add classes due to a server error.' 
        });
    }
};

// @desc    Delete a class from the school
// @route   DELETE /api/v1/school/classes/:id
exports.deleteClass = async (req, res) => {
    try {
        const schoolId = req.user.school_id;
        const classId = req.params.id;

        const affectedRows = await schoolModel.deleteClass(classId, schoolId);

        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Class not found or you do not have permission to delete it' });
        }

        res.status(200).json({ success: true, message: 'Class deleted successfully' });
    } catch (error) {
        console.error('Delete Class Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete class' });
    }
};

// ==========================================
// BULK UPLOAD LOGIC
// ==========================================

// Helper to parse file into an array of objects
const parseFile = (filePath) => {
    return new Promise((resolve, reject) => {
        const ext = path.extname(filePath).toLowerCase();
        const results = [];

        if (ext === '.csv') {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => resolve(results))
                .on('error', (err) => reject(err));
        } else if (ext === '.xlsx') {
            try {
                const workbook = xlsx.readFile(filePath);
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = xlsx.utils.sheet_to_json(sheet);
                resolve(data);
            } catch (err) {
                reject(err);
            }
        }
    });
};

// @desc    Bulk upload schools and create school_super_admin accounts
// @route   POST /api/v1/schools/bulk
exports.bulkUploadSchools = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload a CSV or XLSX file.' });
    }

    const filePath = req.file.path;
    let insertedSchools = 0;
    let createdAdmins = 0;
    const skipped = [];

    try {
        const rows = await parseFile(filePath);
        const connection = await pool.getConnection();

        // Process rows sequentially to safely handle DB checks and transactions
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNum = i + 2; // +2 accounts for 0-index and the header row

            const { name, code, cluster_id, city, state, contact_person, contact_email, contact_phone, status } = row;

            // 1. Validate Required Fields
            if (!name || !code || !cluster_id || !contact_email || !contact_person) {
                skipped.push({ row: rowNum, reason: 'Missing required fields (name, code, cluster_id, contact_person, contact_email)' });
                continue;
            }

            // 2. Validate Cluster exists
            const [clusterCheck] = await connection.query('SELECT id FROM clusters WHERE id = ?', [cluster_id]);
            if (clusterCheck.length === 0) {
                skipped.push({ row: rowNum, reason: `Invalid cluster_id: ${cluster_id}` });
                continue;
            }

            // 3. Duplicate Checks (School Code & Email)
            const [schoolCheck] = await connection.query('SELECT id FROM schools WHERE code = ?', [code]);
            if (schoolCheck.length > 0) {
                skipped.push({ row: rowNum, reason: `Duplicate school code: ${code}` });
                continue;
            }

            const [userCheck] = await connection.query('SELECT id FROM users WHERE username = ?', [contact_email]);
            if (userCheck.length > 0) {
                skipped.push({ row: rowNum, reason: `Duplicate email: ${contact_email}` });
                continue;
            }

            // 4. Transaction: Insert School & User safely
            try {
                await connection.beginTransaction();

                // Insert School
                const schoolQuery = `
                    INSERT INTO schools (name, code, cluster_id, city, state, contact_person, contact_email, contact_phone, status) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                const [schoolResult] = await connection.query(schoolQuery, [
                    name, code, cluster_id, city, state, contact_person, contact_email, contact_phone, status || 'active'
                ]);
                const newSchoolId = schoolResult.insertId;

                // Insert User (school_super_admin)
                const hashedPassword = await bcrypt.hash(contact_email.toString(), 10);
                const userQuery = `
                    INSERT INTO users (school_id, name, username, password_hash, role, status, force_password_change) 
                    VALUES (?, ?, ?, ?, 'school_super_admin', 'active', true)
                `;
                await connection.query(userQuery, [
                    newSchoolId, contact_person, contact_email, hashedPassword
                ]);

                await connection.commit();
                insertedSchools++;
                createdAdmins++;

            } catch (err) {
                await connection.rollback();
                console.error(`Error inserting row ${rowNum}:`, err);
                skipped.push({ row: rowNum, reason: 'Database insertion error' });
            }
        }

        connection.release();

        // Delete the file to save disk space
        fs.unlinkSync(filePath);

        // Response
        if (insertedSchools === 0) {
            return res.status(400).json({
                success: false,
                message: "No schools were registered. All rows failed validation.",
                errors: skipped
            });
        }

        res.status(200).json({
            success: true,
            message: "Bulk upload processed successfully",
            inserted_schools: insertedSchools,
            created_admins: createdAdmins,
            skipped: skipped
        });

    } catch (error) {
        console.error("Bulk upload error:", error);
        // Ensure file is deleted even if parser crashes
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({ success: false, message: "Error processing file" });
    }
};