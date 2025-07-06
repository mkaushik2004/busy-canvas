const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
    getClasses,
    getClass,
    createClass,
    updateClass,
    deleteClass,
    updateClassStatus,
    addClassNote,
    getClassStats,
    getAvailableSlots
} = require('../controllers/classes');

const router = express.Router();

// Validation middleware
const createClassValidation = [
    body('studentDetails.name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Student name must be between 2 and 50 characters'),
    body('studentDetails.email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('studentDetails.phone')
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Please provide a valid phone number'),
    body('studentDetails.age')
        .isInt({ min: 5, max: 100 })
        .withMessage('Student age must be between 5 and 100'),
    body('classDetails.type')
        .isIn(['consultation', 'beginner', 'intermediate', 'advanced', 'workshop', 'private'])
        .withMessage('Please select a valid class type'),
    body('classDetails.medium')
        .isIn(['pencil', 'watercolor', 'acrylic', 'oil', 'digital', 'mixed'])
        .withMessage('Please select a valid art medium'),
    body('classDetails.duration')
        .isIn(['1hour', '2hour', '3hour', 'full-day', 'weekend'])
        .withMessage('Please select a valid class duration'),
    body('classDetails.size')
        .isIn(['private', 'small', 'medium', 'large'])
        .withMessage('Please select a valid class size'),
    body('schedule.preferredDate')
        .isISO8601()
        .withMessage('Please provide a valid date'),
    body('schedule.preferredTime')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Please provide a valid time format (HH:MM)'),
    body('experience.level')
        .isIn(['beginner', 'basic', 'intermediate', 'advanced', 'professional'])
        .withMessage('Please select a valid experience level'),
    body('budget')
        .isIn(['500-1000', '1000-2000', '2000-5000', '5000+'])
        .withMessage('Please select a valid budget range'),
    body('experience.goals')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Learning goals cannot exceed 500 characters'),
    body('specialRequests')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Special requests cannot exceed 500 characters')
];

const updateClassValidation = [
    body('status')
        .optional()
        .isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rescheduled'])
        .withMessage('Please select a valid status'),
    body('schedule.confirmedDate')
        .optional()
        .isISO8601()
        .withMessage('Please provide a valid date'),
    body('schedule.confirmedTime')
        .optional()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Please provide a valid time format (HH:MM)')
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

// Student routes
router.route('/')
    .get(getClasses)
    .post(createClassValidation, handleValidationErrors, createClass);

router.route('/:id')
    .get(getClass)
    .put(authorize('admin', 'artist'), updateClassValidation, handleValidationErrors, updateClass)
    .delete(authorize('admin'), deleteClass);

// Admin/Instructor routes
router.put('/:id/status', authorize('admin', 'artist'), updateClassStatus);
router.post('/:id/notes', authorize('admin', 'artist'), addClassNote);
router.get('/stats/overview', authorize('admin', 'artist'), getClassStats);
router.get('/slots/available', getAvailableSlots);

module.exports = router; 