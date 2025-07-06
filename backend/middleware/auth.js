const jwt = require('jsonwebtoken');
const { dbHelper } = require('../database/database');

// Protect routes
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Not authorized to access this route'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await dbHelper.get(
            'SELECT id, fullName, username, email, role, isEmailVerified FROM users WHERE id = ?',
            [decoded.id]
        );

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'User not found'
            });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({
            status: 'error',
            message: 'Not authorized to access this route'
        });
    }
};

// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Not authorized to access this route'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// Optional authentication (for public routes that can show different content for logged-in users)
const optionalAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await dbHelper.get(
                'SELECT id, fullName, username, email, role FROM users WHERE id = ?',
                [decoded.id]
            );
            if (user) {
                req.user = user;
            }
        } catch (err) {
            // Token is invalid, but we don't want to block the request
            // Silently ignore invalid tokens in optional auth
        }
    }

    next();
};

module.exports = {
    protect,
    authorize,
    optionalAuth
}; 