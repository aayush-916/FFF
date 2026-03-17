const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure upload directories exist
const ensureDirectoryExistence = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

ensureDirectoryExistence('uploads/lessons');
ensureDirectoryExistence('uploads/guides');
ensureDirectoryExistence('uploads/bulk'); // 👈 NEW: Folder for bulk CSV/XLSX files

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // 👈 NEW: Catch dynamic material_file_X names
        if (file.fieldname.startsWith('material_file_')) {
            cb(null, 'uploads/lessons/');
        } else if (file.fieldname === 'teacher_guide') {
            cb(null, 'uploads/guides/');
        } else if (file.fieldname === 'file') {
            cb(null, 'uploads/bulk/');
        } else {
            cb(new Error('Invalid field name'), false);
        }
    },
    filename: (req, file, cb) => {
        // Create a unique filename: timestamp-originalName
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Logic for Lessons and Guides (PDFs only)
    if (file.fieldname.startsWith('material_file_') || file.fieldname === 'teacher_guide') {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed for lessons and guides!'), false);
        }
    }
    // 👈 NEW: Logic for Bulk School Registration (CSV/XLSX only)
    else if (file.fieldname === 'file') {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.csv' || ext === '.xlsx') {
            cb(null, true);
        } else {
            cb(new Error('Only .csv and .xlsx files are allowed for bulk upload!'), false);
        }
    } 
    // Fallback
    else {
        cb(new Error('Unexpected field name'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB file size limit
});

// Existing Export: Middleware for lesson files
exports.uploadLessonFiles = upload.fields([
    { name: 'lesson_pdf', maxCount: 1 },
    { name: 'teacher_guide', maxCount: 1 }
]);

// 👈 NEW Export: Middleware for bulk file uploads
exports.uploadDynamicLessonFiles = upload.any();
exports.uploadBulkFile = upload.single('file');