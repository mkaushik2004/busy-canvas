const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
    submitContact,
    getContacts,
    getContact,
    updateContact,
    deleteContact,
    respondToContact,
    assignContact,
    getContactStats
} = require('../controllers/contact');

const router = express.Router();

// Validation middleware
const submitContactValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('phone')
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Please provide a valid phone number'),
    body('subject')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Subject must be between 1 and 100 characters'),
    body('message')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Message must be between 1 and 1000 characters'),
    body('category')
        .optional()
        .isIn(['general', 'order-inquiry', 'class-inquiry', 'partnership', 'feedback', 'complaint', 'other'])
        .withMessage('Please select a valid category')
];

const updateContactValidation = [
    body('status')
        .optional()
        .isIn(['new', 'in-progress', 'responded', 'resolved', 'closed'])
        .withMessage('Please select a valid status'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Please select a valid priority'),
    body('response.content')
        .optional()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Response content must be between 1 and 1000 characters')
];

// Apply validation results
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Public routes
router.post('/', submitContactValidation, handleValidationErrors, submitContact);

// Admin routes (require authentication and admin role)
router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(getContacts);

router.route('/:id')
    .get(getContact)
    .put(updateContactValidation, handleValidationErrors, updateContact)
    .delete(deleteContact);

router.post('/:id/respond', respondToContact);
router.put('/:id/assign', assignContact);
router.get('/stats/overview', getContactStats);

module.exports = router; 