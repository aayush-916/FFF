const assessmentService = require('../services/assessmentService');

const handleError = (res, error) => {
    console.error('Assessment API Error:', error.message);
    
    if (error.message.includes('NOT_FOUND')) {
        return res.status(404).json({ success: false, message: error.message.replace('NOT_FOUND: ', '') });
    }
    if (error.message.includes('BAD_REQUEST')) {
        return res.status(400).json({ success: false, message: error.message.replace('BAD_REQUEST: ', '') });
    }
    if (error.message.includes('FORBIDDEN')) {
        return res.status(403).json({ success: false, message: error.message.replace('FORBIDDEN: ', '') });
    }
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'An assessment for this phase has already been submitted by this school.' });
    }
    
    res.status(500).json({ success: false, message: 'Internal Server Error' });
};

// @desc    Create a new wellbeing assessment
// @route   POST /api/v1/assessments
exports.createAssessment = async (req, res) => {
    try {
        // req.user is passed to the service to enforce school_id matching
        const newAssessment = await assessmentService.createAssessment(req.body, req.user);
        res.status(201).json({ success: true, data: newAssessment });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get assessments (Context-Aware: Global for NGO, Local for School)
// @route   GET /api/v1/assessments
exports.getAssessments = async (req, res) => {
    try {
        let assessments;
        
        // 1. If NGO Staff -> Fetch ALL assessments across all schools
        if (req.user.role === 'ngo_super_admin' || req.user.role === 'ngo_staff') {
            assessments = await assessmentService.getAllAssessments();
        } 
        // 2. If School Admin or Teacher -> Fetch ONLY their school's assessments automatically
        else {
            if (!req.user.school_id) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Access Denied: No school assigned to this user.' 
                });
            }
            // Pass req.user down to the service for secondary validation if needed
            assessments = await assessmentService.getAssessmentsBySchool(req.user.school_id, req.user);
        }

        res.status(200).json({ 
            success: true, 
            count: assessments?.length || 0, 
            data: assessments 
        });
        
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get assessments for a specific school
// @route   GET /api/v1/assessments/:school_id
exports.getAssessmentsBySchool = async (req, res) => {
    try {
        // 🔒 SECURITY PATCH: Cross-Tenant Data Leak Prevention
        // If the user is a school admin/teacher, they can ONLY fetch their own school_id
        if (req.user.role !== 'ngo_super_admin' && req.user.role !== 'ngo_staff') {
            if (parseInt(req.params.school_id) !== req.user.school_id) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Access Denied: You cannot view assessment data for other schools.' 
                });
            }
        }

        // Pass req.user down to the service for secondary validation if needed
        const assessments = await assessmentService.getAssessmentsBySchool(req.params.school_id, req.user);
        res.status(200).json({ success: true, count: assessments.length, data: assessments });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get the current assessment phase status for the logged-in school
// @route   GET /api/v1/assessments/status
exports.getAssessmentStatus = async (req, res) => {
    try {
        // 1. MUST get the school_id from the authenticated user
        const schoolId = req.user.school_id;

        if (!schoolId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access Denied: User is not associated with a school.' 
            });
        }

        // 2. Fetch assessments strictly locked to THIS school
        const assessments = await assessmentService.getAssessmentsBySchool(schoolId, req.user);

        // 3. Map the results to determine completed phases
        const completedPhases = assessments.map(a => a.phase);

        res.status(200).json({
            success: true,
            data: {
                assessments: assessments,
                completedPhases: completedPhases
            }
        });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Update an assessment
// @route   PUT /api/v1/assessments/:id
exports.updateAssessment = async (req, res) => {
    try {
        // req.user is passed to the service so it can append `WHERE school_id = req.user.school_id`
        const updatedAssessment = await assessmentService.updateAssessment(req.params.id, req.body, req.user);
        res.status(200).json({ success: true, data: updatedAssessment });
    } catch (error) {
        handleError(res, error);
    }
};