const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    updateProfile,
    uploadProfileImage,
    getUserStats,
    getArtistProfile
} = require('../controllers/users');

const router = express.Router();

// Validation middleware
const updateUserValidation = [
    body('fullName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Full name must be between 2 and 50 characters'),
    body('username')
        .optional()
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('phone')
        .optional()
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Please provide a valid phone number'),
    body('role')
        .optional()
        .isIn(['user', 'artist', 'admin'])
        .withMessage('Please select a valid role'),
    body('preferences.artStyle')
        .optional()
        .isArray()
        .withMessage('Art style preferences must be an array'),
    body('preferences.colorScheme')
        .optional()
        .isArray()
        .withMessage('Color scheme preferences must be an array'),
    body('preferences.notifications.email')
        .optional()
        .isBoolean()
        .withMessage('Email notification preference must be a boolean'),
    body('preferences.notifications.sms')
        .optional()
        .isBoolean()
        .withMessage('SMS notification preference must be a boolean'),
    body('newsletterSubscription')
        .optional()
        .isBoolean()
        .withMessage('Newsletter subscription must be a boolean')
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

// User routes (own profile)
router.get('/profile', getUser);
router.put('/profile', updateUserValidation, handleValidationErrors, updateProfile);
router.post('/profile/image', uploadProfileImage);

// Artist routes
router.get('/artist/:id', getArtistProfile);

// Admin routes
router.route('/')
    .get(authorize('admin'), getUsers);

router.route('/:id')
    .get(authorize('admin'), getUser)
    .put(authorize('admin'), updateUserValidation, handleValidationErrors, updateUser)
    .delete(authorize('admin'), deleteUser);

router.get('/stats/overview', authorize('admin'), getUserStats);

module.exports = router; 