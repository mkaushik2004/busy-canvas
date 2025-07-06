const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
    getOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    updateOrderProgress,
    addOrderNote,
    getOrderStats
} = require('../controllers/orders');

const router = express.Router();

// Validation middleware
const createOrderValidation = [
    body('customerDetails.name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Customer name must be between 2 and 50 characters'),
    body('customerDetails.email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('customerDetails.phone')
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Please provide a valid phone number'),
    body('artworkDetails.type')
        .isIn(['portrait', 'landscape', 'abstract', 'still-life', 'custom'])
        .withMessage('Please select a valid artwork type'),
    body('artworkDetails.style')
        .isIn(['realistic', 'impressionist', 'abstract', 'cartoon', 'watercolor', 'oil-painting'])
        .withMessage('Please select a valid art style'),
    body('artworkDetails.size')
        .isIn(['small', 'medium', 'large', 'xlarge', 'custom'])
        .withMessage('Please select a valid canvas size'),
    body('urgency')
        .isIn(['standard', 'rush', 'express'])
        .withMessage('Please select a valid urgency level'),
    body('budget')
        .isIn(['2000-3000', '3000-5000', '5000-8000', '8000+'])
        .withMessage('Please select a valid budget range'),
    body('specialInstructions')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Special instructions cannot exceed 1000 characters')
];

const updateOrderValidation = [
    body('status')
        .optional()
        .isIn(['pending', 'confirmed', 'in-progress', 'review', 'completed', 'delivered', 'cancelled'])
        .withMessage('Please select a valid status'),
    body('progress.currentStage')
        .optional()
        .isIn(['sketch', 'base-colors', 'details', 'final-touches', 'review'])
        .withMessage('Please select a valid progress stage')
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

// All routes require authentication
router.use(protect);

// Customer routes
router.route('/')
    .get(getOrders)
    .post(createOrderValidation, handleValidationErrors, createOrder);

router.route('/:id')
    .get(getOrder)
    .put(authorize('admin', 'artist'), updateOrderValidation, handleValidationErrors, updateOrder)
    .delete(authorize('admin'), deleteOrder);

// Admin/Artist routes
router.put('/:id/status', authorize('admin', 'artist'), updateOrderStatus);
router.put('/:id/progress', authorize('admin', 'artist'), updateOrderProgress);
router.post('/:id/notes', authorize('admin', 'artist'), addOrderNote);
router.get('/stats/overview', authorize('admin', 'artist'), getOrderStats);

module.exports = router; 