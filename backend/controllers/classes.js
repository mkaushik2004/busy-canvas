const ErrorResponse = require('../utils/errorResponse');
const { dbHelper } = require('../database/database');

// @desc    Get all classes for user
// @route   GET /api/classes
// @access  Private
const getClasses = async (req, res, next) => {
    try {
        const classes = await Class.find({ user: req.user.id }).populate('instructor', 'fullName username');
        
        res.status(200).json({
            status: 'success',
            count: classes.length,
            data: classes
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Private
const getClass = async (req, res, next) => {
    try {
        const classItem = await Class.findById(req.params.id).populate('instructor', 'fullName username');

        if (!classItem) {
            return next(new ErrorResponse(`Class not found with id of ${req.params.id}`, 404));
        }

        res.status(200).json({
            status: 'success',
            data: classItem
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new class booking
// @route   POST /api/classes
// @access  Private
const createClass = async (req, res, next) => {
    try {
        req.body.user = req.user.id;
        
        // Calculate pricing
        const basePrices = {
            'consultation': 0,
            'beginner': 500,
            'intermediate': 800,
            'advanced': 1200,
            'workshop': 1500,
            'private': 2000
        };

        const durationMultipliers = {
            '1hour': 1,
            '2hour': 1.8,
            '3hour': 2.5,
            'full-day': 6,
            'weekend': 12
        };

        const sizeDiscounts = {
            'private': 0,
            'small': 100,
            'medium': 200,
            'large': 300
        };

        const basePrice = basePrices[req.body.classDetails.type] || 500;
        const durationMultiplier = durationMultipliers[req.body.classDetails.duration] || 1;
        const sizeDiscount = sizeDiscounts[req.body.classDetails.size] || 0;

        req.body.pricing = {
            basePrice,
            durationMultiplier,
            sizeDiscount,
            totalAmount: (basePrice * durationMultiplier) - sizeDiscount
        };

        const classItem = await Class.create(req.body);

        res.status(201).json({
            status: 'success',
            data: classItem
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private
const updateClass = async (req, res, next) => {
    try {
        let classItem = await Class.findById(req.params.id);

        if (!classItem) {
            return next(new ErrorResponse(`Class not found with id of ${req.params.id}`, 404));
        }

        classItem = await Class.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: classItem
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private
const deleteClass = async (req, res, next) => {
    try {
        const classItem = await Class.findById(req.params.id);

        if (!classItem) {
            return next(new ErrorResponse(`Class not found with id of ${req.params.id}`, 404));
        }

        await classItem.remove();

        res.status(200).json({
            status: 'success',
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update class status
// @route   PUT /api/classes/:id/status
// @access  Private
const updateClassStatus = async (req, res, next) => {
    try {
        const classItem = await Class.findById(req.params.id);

        if (!classItem) {
            return next(new ErrorResponse(`Class not found with id of ${req.params.id}`, 404));
        }

        classItem.status = req.body.status;
        await classItem.save();

        res.status(200).json({
            status: 'success',
            data: classItem
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add class note
// @route   POST /api/classes/:id/notes
// @access  Private
const addClassNote = async (req, res, next) => {
    try {
        const classItem = await Class.findById(req.params.id);

        if (!classItem) {
            return next(new ErrorResponse(`Class not found with id of ${req.params.id}`, 404));
        }

        if (req.user.role === 'artist' || req.user.role === 'admin') {
            classItem.addInstructorNote(req.body.note);
        } else {
            classItem.addStudentNote(req.body.note);
        }

        res.status(200).json({
            status: 'success',
            data: classItem
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get class statistics
// @route   GET /api/classes/stats/overview
// @access  Private
const getClassStats = async (req, res, next) => {
    try {
        const stats = await Class.aggregate([
            {
                $group: {
                    _id: null,
                    totalClasses: { $sum: 1 },
                    totalRevenue: { $sum: '$pricing.totalAmount' },
                    averageClassValue: { $avg: '$pricing.totalAmount' },
                    pendingClasses: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    confirmedClasses: {
                        $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
                    },
                    completedClasses: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    }
                }
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: stats[0] || {
                totalClasses: 0,
                totalRevenue: 0,
                averageClassValue: 0,
                pendingClasses: 0,
                confirmedClasses: 0,
                completedClasses: 0
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get available time slots
// @route   GET /api/classes/slots/available
// @access  Private
const getAvailableSlots = async (req, res, next) => {
    try {
        // This would typically check against booked classes and return available slots
        // For now, returning a simple response
        res.status(200).json({
            status: 'success',
            data: {
                message: 'Available slots functionality to be implemented'
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getClasses,
    getClass,
    createClass,
    updateClass,
    deleteClass,
    updateClassStatus,
    addClassNote,
    getClassStats,
    getAvailableSlots
}; 