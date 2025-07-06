const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { dbHelper } = require('../database/database');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const { fullName, username, email, password, phone, newsletterSubscription } = req.body;

        // Check if user already exists
        const existingUser = await dbHelper.get(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUser) {
            return next(new ErrorResponse('User already exists with this email or username', 400));
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate email verification token
        const verificationToken = crypto.randomBytes(20).toString('hex');
        const verificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        // Create user
        const result = await dbHelper.run(
            `INSERT INTO users (fullName, username, email, password, phone, newsletterSubscription, emailVerificationToken, emailVerificationExpire) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [fullName, username, email, hashedPassword, phone, newsletterSubscription ? 1 : 0, verificationToken, verificationExpire]
        );

        // Get created user
        const user = await dbHelper.get(
            'SELECT id, fullName, username, email, role FROM users WHERE id = ?',
            [result.id]
        );

        // Send verification email
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
        const message = `You are receiving this email because you registered for Busy Canvas. Please verify your email by clicking the link: \n\n ${verificationUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Email Verification - Busy Canvas',
                message
            });

            res.status(201).json({
                status: 'success',
                message: 'Registration successful. Please check your email to verify your account.',
                data: { user }
            });
        } catch (err) {
            // Clear verification token if email fails
            await dbHelper.run(
                'UPDATE users SET emailVerificationToken = NULL, emailVerificationExpire = NULL WHERE id = ?',
                [user.id]
            );

            return next(new ErrorResponse('Email could not be sent', 500));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return next(new ErrorResponse('Please provide an email and password', 400));
        }

        // Check for user
        const user = await dbHelper.get(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (!user) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            return next(new ErrorResponse('Please verify your email before logging in', 401));
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
    });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const user = await dbHelper.get(
            'SELECT id, fullName, username, email, phone, role, profileImage, isEmailVerified, newsletterSubscription, preferences, createdAt FROM users WHERE id = ?',
            [req.user.id]
        );

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
const updateDetails = async (req, res, next) => {
    try {
        const { fullName, email, phone } = req.body;

        await dbHelper.run(
            'UPDATE users SET fullName = ?, email = ?, phone = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [fullName, email, phone, req.user.id]
        );

        const user = await dbHelper.get(
            'SELECT id, fullName, username, email, phone, role FROM users WHERE id = ?',
            [req.user.id]
        );

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await dbHelper.get(
            'SELECT * FROM users WHERE id = ?',
            [req.user.id]
        );

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return next(new ErrorResponse('Password is incorrect', 401));
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await dbHelper.run(
            'UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [hashedPassword, req.user.id]
        );

        // Get updated user
        const updatedUser = await dbHelper.get(
            'SELECT id, fullName, username, email, role FROM users WHERE id = ?',
            [req.user.id]
        );

        sendTokenResponse(updatedUser, 200, res);
    } catch (error) {
        next(error);
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await dbHelper.get(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (!user) {
            return next(new ErrorResponse('There is no user with that email', 404));
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetExpire = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

        // Hash token and save to database
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        await dbHelper.run(
            'UPDATE users SET resetPasswordToken = ?, resetPasswordExpire = ? WHERE id = ?',
            [hashedToken, resetExpire, user.id]
        );

        // Create reset url
        const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;
        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password reset token',
                message
            });

            res.status(200).json({
                status: 'success',
                message: 'Email sent'
            });
        } catch (err) {
            await dbHelper.run(
                'UPDATE users SET resetPasswordToken = NULL, resetPasswordExpire = NULL WHERE id = ?',
                [user.id]
            );

            return next(new ErrorResponse('Email could not be sent', 500));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res, next) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await dbHelper.get(
            'SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpire > datetime("now")',
            [resetPasswordToken]
        );

        if (!user) {
            return next(new ErrorResponse('Invalid token', 400));
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Set new password and clear reset token
        await dbHelper.run(
            'UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpire = NULL, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [hashedPassword, user.id]
        );

        const updatedUser = await dbHelper.get(
            'SELECT id, fullName, username, email, role FROM users WHERE id = ?',
            [user.id]
        );

        sendTokenResponse(updatedUser, 200, res);
    } catch (error) {
        next(error);
    }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res, next) => {
    try {
        // Get hashed token
        const emailVerificationToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await dbHelper.get(
            'SELECT * FROM users WHERE emailVerificationToken = ? AND emailVerificationExpire > datetime("now")',
            [emailVerificationToken]
        );

        if (!user) {
            return next(new ErrorResponse('Invalid or expired verification token', 400));
        }

        // Verify email
        await dbHelper.run(
            'UPDATE users SET isEmailVerified = 1, emailVerificationToken = NULL, emailVerificationExpire = NULL, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );

        res.status(200).json({
            status: 'success',
            message: 'Email verified successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await dbHelper.get(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (!user) {
            return next(new ErrorResponse('User not found', 404));
        }

        if (user.isEmailVerified) {
            return next(new ErrorResponse('Email is already verified', 400));
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(20).toString('hex');
        const verificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        await dbHelper.run(
            'UPDATE users SET emailVerificationToken = ?, emailVerificationExpire = ? WHERE id = ?',
            [verificationToken, verificationExpire, user.id]
        );

        // Send verification email
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
        const message = `You are receiving this email because you requested email verification for Busy Canvas. Please verify your email by clicking the link: \n\n ${verificationUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Email Verification - Busy Canvas',
                message
            });

            res.status(200).json({
                status: 'success',
                message: 'Verification email sent'
            });
        } catch (err) {
            await dbHelper.run(
                'UPDATE users SET emailVerificationToken = NULL, emailVerificationExpire = NULL WHERE id = ?',
                [user.id]
            );

            return next(new ErrorResponse('Email could not be sent', 500));
        }
    } catch (error) {
        next(error);
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user: {
                id: user.id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified
            }
        }
    });
};

module.exports = {
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
}; 