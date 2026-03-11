const mcqService = require('../services/mcqService');

const handleError = (res, error) => {
    console.error('MCQ API Error:', error.message);
    if (error.message.includes('NOT_FOUND')) {
        return res.status(404).json({ success: false, message: error.message.replace('NOT_FOUND: ', '') });
    }
    if (error.message.includes('BAD_REQUEST')) {
        return res.status(400).json({ success: false, message: error.message.replace('BAD_REQUEST: ', '') });
    }
    res.status(500).json({ success: false, message: 'Internal Server Error' });
};

// @desc    Create a new MCQ Question
// @route   POST /api/v1/mcq
exports.createMcq = async (req, res) => {
    try {
        const newMcq = await mcqService.createMcq(req.body);
        res.status(201).json({ success: true, data: newMcq });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get all MCQ Questions (supports filtering by ?lesson_id=1)
// @route   GET /api/v1/mcq
exports.getMcqs = async (req, res) => {
    try {
        const { lesson_id } = req.query;
        const mcqs = await mcqService.getAllMcqs(lesson_id);
        res.status(200).json({ success: true, count: mcqs.length, data: mcqs });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get single MCQ Question
// @route   GET /api/v1/mcq/:id
exports.getMcq = async (req, res) => {
    try {
        const mcq = await mcqService.getMcqById(req.params.id);
        res.status(200).json({ success: true, data: mcq });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Update MCQ Question
// @route   PUT /api/v1/mcq/:id
exports.updateMcq = async (req, res) => {
    try {
        const updatedMcq = await mcqService.updateMcq(req.params.id, req.body);
        res.status(200).json({ success: true, data: updatedMcq });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Delete MCQ Question
// @route   DELETE /api/v1/mcq/:id
exports.deleteMcq = async (req, res) => {
    try {
        await mcqService.deleteMcq(req.params.id);
        res.status(200).json({ success: true, message: 'MCQ Question deleted successfully' });
    } catch (error) {
        handleError(res, error);
    }
};