const mcqResponseService = require('../services/mcqResponseService');

const handleError = (res, error) => {
    console.error('MCQ Response API Error:', error.message);
    if (error.message.includes('NOT_FOUND')) {
        return res.status(404).json({ success: false, message: error.message.replace('NOT_FOUND: ', '') });
    }
    if (error.message.includes('BAD_REQUEST')) {
        return res.status(400).json({ success: false, message: error.message.replace('BAD_REQUEST: ', '') });
    }
    res.status(500).json({ success: false, message: 'Internal Server Error' });
};

// @desc    Submit batch MCQ responses for a session
// @route   POST /api/v1/mcq-responses
exports.createResponses = async (req, res) => {
    try {
        const result = await mcqResponseService.createResponses(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get all MCQ responses
// @route   GET /api/v1/mcq-responses
exports.getResponses = async (req, res) => {
    try {
        const responses = await mcqResponseService.getAllResponses();
        res.status(200).json({ success: true, count: responses.length, data: responses });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get MCQ responses for a specific session
// @route   GET /api/v1/mcq-responses/:session_id
exports.getResponsesBySession = async (req, res) => {
    try {
        const responses = await mcqResponseService.getResponsesBySession(req.params.session_id);
        res.status(200).json({ success: true, count: responses.length, data: responses });
    } catch (error) {
        handleError(res, error);
    }
};