const habitService = require('../services/habitService');

const handleError = (res, error) => {
    console.error('Habit API Error:', error.message);
    
    if (error.message.includes('NOT_FOUND')) {
        return res.status(404).json({ success: false, message: error.message.replace('NOT_FOUND: ', '') });
    }
    if (error.message.includes('BAD_REQUEST')) {
        return res.status(400).json({ success: false, message: error.message.replace('BAD_REQUEST: ', '') });
    }
    
    res.status(500).json({ success: false, message: 'Internal Server Error' });
};

// @desc    Create a new habit
// @route   POST /api/v1/habits
exports.createHabit = async (req, res) => {
    try {
        const newHabit = await habitService.createHabit(req.body);
        res.status(201).json({ success: true, data: newHabit });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get all habits (supports filtering by ?domain_id=1)
// @route   GET /api/v1/habits
exports.getHabits = async (req, res) => {
    try {
        const { domain_id } = req.query;
        const habits = await habitService.getAllHabits(domain_id);
        res.status(200).json({ success: true, count: habits.length, data: habits });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get single habit
// @route   GET /api/v1/habits/:id
exports.getHabit = async (req, res) => {
    try {
        const habit = await habitService.getHabitById(req.params.id);
        res.status(200).json({ success: true, data: habit });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Update habit
// @route   PUT /api/v1/habits/:id
exports.updateHabit = async (req, res) => {
    try {
        const updatedHabit = await habitService.updateHabit(req.params.id, req.body);
        res.status(200).json({ success: true, data: updatedHabit });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Delete habit
// @route   DELETE /api/v1/habits/:id
exports.deleteHabit = async (req, res) => {
    try {
        await habitService.deleteHabit(req.params.id);
        res.status(200).json({ success: true, message: 'Habit deleted successfully' });
    } catch (error) {
        handleError(res, error);
    }
};