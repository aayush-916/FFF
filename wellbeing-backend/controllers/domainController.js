const domainService = require('../services/domainService');

const handleError = (res, error) => {
    console.error('Domain API Error:', error.message);
    
    if (error.message.includes('NOT_FOUND')) {
        return res.status(404).json({ success: false, message: error.message.replace('NOT_FOUND: ', '') });
    }
    if (error.message.includes('BAD_REQUEST')) {
        return res.status(400).json({ success: false, message: error.message.replace('BAD_REQUEST: ', '') });
    }
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'A domain with this name already exists' });
    }
    
    res.status(500).json({ success: false, message: 'Internal Server Error' });
};

// @desc    Create new domain
// @route   POST /api/v1/domains
exports.createDomain = async (req, res) => {
    try {
        const newDomain = await domainService.createDomain(req.body);
        res.status(201).json({ success: true, data: newDomain });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get all domains
// @route   GET /api/v1/domains
exports.getDomains = async (req, res) => {
    try {
        const domains = await domainService.getAllDomains();
        res.status(200).json({ success: true, count: domains.length, data: domains });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get single domain
// @route   GET /api/v1/domains/:id
exports.getDomain = async (req, res) => {
    try {
        const domain = await domainService.getDomainById(req.params.id);
        res.status(200).json({ success: true, data: domain });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Update domain
// @route   PUT /api/v1/domains/:id
exports.updateDomain = async (req, res) => {
    try {
        const updatedDomain = await domainService.updateDomain(req.params.id, req.body);
        res.status(200).json({ success: true, data: updatedDomain });
    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Delete domain
// @route   DELETE /api/v1/domains/:id
exports.deleteDomain = async (req, res) => {
    try {
        await domainService.deleteDomain(req.params.id);
        res.status(200).json({ success: true, message: 'Domain deleted successfully' });
    } catch (error) {
        handleError(res, error);
    }
};