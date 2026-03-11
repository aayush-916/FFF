const mcqResponseModel = require('../models/mcqResponseModel');
const sessionModel = require('../models/sessionModel');
const mcqModel = require('../models/mcqModel');

exports.createResponses = async (data) => {
    // 1. Basic validation
    if (!data.session_id || !data.responses || !Array.isArray(data.responses) || data.responses.length === 0) {
        throw new Error('BAD_REQUEST: session_id and a non-empty responses array are required');
    }

    // 2. Validate that the session exists
    const sessionExists = await sessionModel.findById(data.session_id);
    if (!sessionExists) {
        throw new Error('BAD_REQUEST: Invalid session_id. The specified session does not exist.');
    }

    // 3. Validate that all questions exist and payload is formatted correctly
    for (const response of data.responses) {
        if (!response.question_id || !response.selected_option) {
             throw new Error('BAD_REQUEST: Each response must include question_id and selected_option');
        }
        
        const questionExists = await mcqModel.findById(response.question_id);
        if (!questionExists) {
             throw new Error(`BAD_REQUEST: Invalid question_id '${response.question_id}'. Question does not exist.`);
        }
    }

    // 4. Perform the batch insert
    const insertedCount = await mcqResponseModel.createBatch(data.session_id, data.responses);
    
    return { 
        session_id: data.session_id, 
        responses_logged: insertedCount,
        message: 'Feedback submitted successfully'
    };
};

exports.getAllResponses = async () => {
    return await mcqResponseModel.findAll();
};

exports.getResponsesBySession = async (sessionId) => {
    const responses = await mcqResponseModel.findBySessionId(sessionId);
    if (!responses || responses.length === 0) {
        throw new Error('NOT_FOUND: No responses found for this session');
    }
    return responses;
};