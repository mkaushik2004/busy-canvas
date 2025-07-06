const ErrorResponse = require('../utils/errorResponse');
const { dbHelper } = require('../database/database');

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password');

        res.status(200).json({
            status: 'success',
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
        }

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).select('-password');

        if (!user) {
            return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
        }

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
        }

        await user.remove();

        res.status(200).json({
            status: 'success',
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            fullName: req.body.fullName,
            username: req.body.username,
            email: req.body.email,
            phone: req.body.phone,
            preferences: req.body.preferences,
            newsletterSubscription: req.body.newsletterSubscription
        };

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        }).select('-password');

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload profile image
// @route   POST /api/users/profile/image
// @access  Private
const uploadProfileImage = async (req, res, next) => {
    try {
        // This would typically handle file upload to Cloudinary
        // For now, just updating the profile image field
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { profileImage: req.body.imageUrl },
            { new: true }
        ).select('-password');

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user statistics
// @route   GET /api/users/stats/overview
// @access  Private
const getUserStats = async (req, res, next) => {
    try {
        const stats = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    verifiedUsers: { $sum: { $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0] } },
                    artists: { $sum: { $cond: [{ $eq: ['$role', 'artist'] }, 1, 0] } },
                    admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
                    newsletterSubscribers: { $sum: { $cond: [{ $eq: ['$newsletterSubscription', true] }, 1, 0] } }
                }
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: stats[0] || {
                totalUsers: 0,
                verifiedUsers: 0,
                artists: 0,
                admins: 0,
                newsletterSubscribers: 0
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get artist profile
// @route   GET /api/users/artist/:id
// @access  Private
const getArtistProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('gallery', 'title description images category style medium price');

        if (!user) {
            return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
        }

        if (user.role !== 'artist') {
            return next(new ErrorResponse(`User is not an artist`, 400));
        }

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    updateProfile,
    uploadProfileImage,
    getUserStats,
    getArtistProfile
}; 