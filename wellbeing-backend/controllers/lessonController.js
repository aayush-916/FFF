const lessonService = require('../services/lessonService');

const handleError = (res, error) => {
    console.error('Lesson API Error:', error.message);
    if (error.message.includes('NOT_FOUND')) {
        return res.status(404).json({ success: false, message: error.message.replace('NOT_FOUND: ', '') });
    }
    if (error.message.includes('BAD_REQUEST')) {
        return res.status(400).json({ success: false, message: error.message.replace('BAD_REQUEST: ', '') });
    }
    res.status(500).json({ success: false, message: 'Internal Server Error' });
};

// Helper to extract file paths from multer
const extractFilePaths = (req) => {
    const paths = {};
    if (req.files) {
        if (req.files.lesson_pdf) {
            // Store the relative path so the frontend can append the base URL
            paths.lesson_pdf_url = `/${req.files.lesson_pdf[0].path.replace(/\\/g, '/')}`;
        }
        if (req.files.teacher_guide) {
            paths.teacher_guide_url = `/${req.files.teacher_guide[0].path.replace(/\\/g, '/')}`;
        }
    }
    return paths;
};

// @desc    Create a new lesson
// @route   POST /api/v1/lessons
exports.createLesson = async (req, res) => {
    try {
        const filePaths = extractFilePaths(req);
        const lessonData = { ...req.body, ...filePaths };
        
        const newLesson = await lessonService.createLesson(lessonData);
        res.status(201).json({ success: true, data: newLesson });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get all lessons (supports filtering by ?habit_id=1&class_number=5)
// @route   GET /api/v1/lessons
exports.getLessons = async (req, res) => {
    try {
        const filters = {
            habit_id: req.query.habit_id,
            class_number: req.query.class_number
        };
        const lessons = await lessonService.getAllLessons(filters);
        res.status(200).json({ success: true, count: lessons.length, data: lessons });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get single lesson
// @route   GET /api/v1/lessons/:id
exports.getLesson = async (req, res) => {
    try {
        const lesson = await lessonService.getLessonById(req.params.id);
        res.status(200).json({ success: true, data: lesson });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Update lesson
// @route   PUT /api/v1/lessons/:id
exports.updateLesson = async (req, res) => {
    try {
        const filePaths = extractFilePaths(req);
        const lessonData = { ...req.body, ...filePaths };

        const updatedLesson = await lessonService.updateLesson(req.params.id, lessonData);
        res.status(200).json({ success: true, data: updatedLesson });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Delete lesson
// @route   DELETE /api/v1/lessons/:id
exports.deleteLesson = async (req, res) => {
    try {
        await lessonService.deleteLesson(req.params.id);
        res.status(200).json({ success: true, message: 'Lesson deleted successfully' });
    } catch (error) {
        handleError(res, error);
    }
};