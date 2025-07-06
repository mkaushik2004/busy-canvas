const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
    register,
    login,
    logout,
    getMe,
    updateDetails,
    updatePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification
} = require('../controllers/auth');

const router = express.Router();

// Validation middleware
const registerValidation = [
    body('fullName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Full name must be between 2 and 50 characters'),
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('phone')
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Please provide a valid phone number')
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const updatePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
];

const forgotPasswordValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email')
];

const resetPasswordValidation = [
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
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
router.post('/register', registerValidation, handleValidationErrors, register);
router.post('/login', loginValidation, handleValidationErrors, login);
router.get('/logout', logout);
router.post('/forgotpassword', forgotPasswordValidation, handleValidationErrors, forgotPassword);
router.put('/resetpassword/:resettoken', resetPasswordValidation, handleValidationErrors, resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', forgotPasswordValidation, handleValidationErrors, resendVerification);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePasswordValidation, handleValidationErrors, updatePassword);

module.exports = router; 