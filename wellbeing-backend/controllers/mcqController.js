const mcqModel = require('../models/mcqModel');

exports.getQuestions = async (req, res) => {
    try {
        const questions = await mcqModel.findAll();
        res.status(200).json({ success: true, count: questions.length, data: questions });
    } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({ success: false, message: 'Server error fetching questions' });
    }
};

exports.getQuestion = async (req, res) => {
    try {
        const question = await mcqModel.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }
        res.status(200).json({ success: true, data: question });
    } catch (error) {
        console.error("Error fetching question:", error);
        res.status(500).json({ success: false, message: 'Server error fetching question' });
    }
};

exports.createQuestion = async (req, res) => {
    try {
        const newId = await mcqModel.createQuestion(req.body);
        const newQuestion = await mcqModel.findById(newId);
        
        res.status(201).json({ 
            success: true, 
            message: 'Question created successfully', 
            data: newQuestion 
        });
    } catch (error) {
        console.error("Error creating question:", error);
        res.status(500).json({ success: false, message: 'Server error creating question' });
    }
};

exports.updateQuestion = async (req, res) => {
    try {
        const affectedRows = await mcqModel.updateQuestion(req.params.id, req.body);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }
        
        const updatedQuestion = await mcqModel.findById(req.params.id);
        res.status(200).json({ success: true, message: 'Question updated successfully', data: updatedQuestion });
    } catch (error) {
        console.error("Error updating question:", error);
        res.status(500).json({ success: false, message: 'Server error updating question' });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        const affectedRows = await mcqModel.deleteQuestion(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }
        res.status(200).json({ success: true, message: 'Question deleted successfully' });
    } catch (error) {
        console.error("Error deleting question:", error);
        res.status(500).json({ success: false, message: 'Server error deleting question' });
    }
};

// --- SCHOOL PANEL FUNCTIONS ---

exports.submitResponses = async (req, res) => {
    try {
        const { session_id, responses } = req.body;

        if (!session_id || !Array.isArray(responses) || responses.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid payload: session_id and a responses array are required.' 
            });
        }

        // Bulk insert all answers to the database
        await mcqModel.saveResponses(session_id, responses);

        res.status(201).json({ 
            success: true, 
            message: 'Assessment submitted successfully' 
        });
    } catch (error) {
        console.error("Error submitting responses:", error);
        res.status(500).json({ success: false, message: 'Server error submitting assessment' });
    }
};