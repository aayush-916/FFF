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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'lesson_pdf') {
            cb(null, 'uploads/lessons/');
        } else if (file.fieldname === 'teacher_guide') {
            cb(null, 'uploads/guides/');
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
    // Accept only PDFs for lessons and guides
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB file size limit
});

// Export middleware for multiple fields
exports.uploadLessonFiles = upload.fields([
    { name: 'lesson_pdf', maxCount: 1 },
    { name: 'teacher_guide', maxCount: 1 }
]);