const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const {
    getGallery,
    getArtwork,
    createArtwork,
    updateArtwork,
    deleteArtwork,
    searchArtwork,
    likeArtwork,
    addComment,
    approveComment,
    getFeaturedArtwork,
    getArtworkStats
} = require('../controllers/gallery');

const router = express.Router();

// Validation middleware
const createArtworkValidation = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Title must be between 1 and 100 characters'),
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('category')
        .isIn(['portrait', 'landscape', 'abstract', 'still-life', 'digital', 'mixed-media'])
        .withMessage('Please select a valid category'),
    body('style')
        .isIn(['realistic', 'impressionist', 'abstract', 'cartoon', 'watercolor', 'oil-painting', 'digital-art'])
        .withMessage('Please select a valid art style'),
    body('medium')
        .isIn(['pencil', 'charcoal', 'watercolor', 'acrylic', 'oil', 'digital', 'mixed'])
        .withMessage('Please select a valid art medium'),
    body('dimensions.width')
        .isFloat({ min: 0.1 })
        .withMessage('Width must be a positive number'),
    body('dimensions.height')
        .isFloat({ min: 0.1 })
        .withMessage('Height must be a positive number'),
    body('dimensions.unit')
        .isIn(['inches', 'cm'])
        .withMessage('Unit must be either inches or cm'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    body('colors')
        .optional()
        .isArray()
        .withMessage('Colors must be an array'),
    body('techniques')
        .optional()
        .isArray()
        .withMessage('Techniques must be an array')
];

const updateArtworkValidation = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Title must be between 1 and 100 characters'),
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('status')
        .optional()
        .isIn(['draft', 'published', 'featured', 'archived'])
        .withMessage('Please select a valid status'),
    body('isForSale')
        .optional()
        .isBoolean()
        .withMessage('isForSale must be a boolean'),
    body('isSold')
        .optional()
        .isBoolean()
        .withMessage('isSold must be a boolean')
];

const commentValidation = [
    body('content')
        .trim()
        .isLength({ min: 1, max: 300 })
        .withMessage('Comment must be between 1 and 300 characters')
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
router.get('/', optionalAuth, getGallery);
router.get('/featured', getFeaturedArtwork);
router.get('/search', optionalAuth, searchArtwork);
router.get('/:id', optionalAuth, getArtwork);

// Protected routes
router.use(protect);

// Artist/Admin routes
router.route('/')
    .post(authorize('artist', 'admin'), createArtworkValidation, handleValidationErrors, createArtwork);

router.route('/:id')
    .put(authorize('artist', 'admin'), updateArtworkValidation, handleValidationErrors, updateArtwork)
    .delete(authorize('artist', 'admin'), deleteArtwork);

// User interaction routes
router.post('/:id/like', likeArtwork);
router.post('/:id/comments', commentValidation, handleValidationErrors, addComment);

// Admin routes
router.put('/:id/comments/:commentId/approve', authorize('admin'), approveComment);
router.get('/stats/overview', authorize('admin'), getArtworkStats);

module.exports = router; 