const { dbHelper } = require('../database/database');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all orders for user
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res, next) => {
    try {
        const orders = await dbHelper.all(
            'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC',
            [req.user.id]
        );

        res.status(200).json({
            status: 'success',
            count: orders.length,
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res, next) => {
    try {
        const order = await dbHelper.get(
            'SELECT * FROM orders WHERE id = ? AND userId = ?',
            [req.params.id, req.user.id]
        );

        if (!order) {
            return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
        }

        res.status(200).json({
            status: 'success',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
    try {
        const {
            customerName,
            customerEmail,
            customerPhone,
            artworkType,
            artworkStyle,
            canvasSize,
            colorScheme,
            urgency,
            budget,
            specialInstructions,
            referenceImages
        } = req.body;

        // Generate order number
        const orderNumber = 'BC' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();

        // Calculate pricing
        const basePrices = {
            'small': 2000,
            'medium': 2500,
            'large': 3000,
            'xlarge': 4000,
            'custom': 3500
        };

        const rushFees = {
            'standard': 0,
            'rush': 500,
            'express': 1000
        };

        const basePrice = basePrices[canvasSize] || 2500;
        const rushFee = rushFees[urgency] || 0;
        const customSizeFee = canvasSize === 'custom' ? 500 : 0;
        const totalAmount = basePrice + rushFee + customSizeFee;

        const pricing = JSON.stringify({
            basePrice,
            rushFee,
            customSizeFee,
            totalAmount
        });

        // Create order
        const result = await dbHelper.run(
            `INSERT INTO orders (userId, orderNumber, customerName, customerEmail, customerPhone, 
             artworkType, artworkStyle, canvasSize, colorScheme, urgency, budget, 
             specialInstructions, referenceImages, pricing) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, orderNumber, customerName, customerEmail, customerPhone,
             artworkType, artworkStyle, canvasSize, colorScheme, urgency, budget,
             specialInstructions, referenceImages, pricing]
        );

        // Get created order
        const order = await dbHelper.get(
            'SELECT * FROM orders WHERE id = ?',
            [result.id]
        );

        res.status(201).json({
            status: 'success',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
const updateOrder = async (req, res, next) => {
    try {
        const order = await dbHelper.get(
            'SELECT * FROM orders WHERE id = ?',
            [req.params.id]
        );

        if (!order) {
            return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
        }

        // Update order
        const updateFields = [];
        const updateValues = [];

        Object.keys(req.body).forEach(key => {
            if (key !== 'id' && key !== 'userId' && key !== 'orderNumber') {
                updateFields.push(`${key} = ?`);
                updateValues.push(req.body[key]);
            }
        });

        if (updateFields.length > 0) {
            updateFields.push('updatedAt = CURRENT_TIMESTAMP');
            updateValues.push(req.params.id);

            await dbHelper.run(
                `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
                updateValues
            );
        }

        // Get updated order
        const updatedOrder = await dbHelper.get(
            'SELECT * FROM orders WHERE id = ?',
            [req.params.id]
        );

        res.status(200).json({
            status: 'success',
            data: updatedOrder
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
const deleteOrder = async (req, res, next) => {
    try {
        const order = await dbHelper.get(
            'SELECT * FROM orders WHERE id = ?',
            [req.params.id]
        );

        if (!order) {
            return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
        }

        await dbHelper.run(
            'DELETE FROM orders WHERE id = ?',
            [req.params.id]
        );

        res.status(200).json({
            status: 'success',
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const result = await dbHelper.run(
            'UPDATE orders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [status, req.params.id]
        );

        if (result.changes === 0) {
            return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
        }

        const order = await dbHelper.get(
            'SELECT * FROM orders WHERE id = ?',
            [req.params.id]
        );

        res.status(200).json({
            status: 'success',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order progress
// @route   PUT /api/orders/:id/progress
// @access  Private
const updateOrderProgress = async (req, res, next) => {
    try {
        const { stage, description, images } = req.body;

        const order = await dbHelper.get(
            'SELECT * FROM orders WHERE id = ?',
            [req.params.id]
        );

        if (!order) {
            return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
        }

        // Parse existing progress or create new
        let progress = order.progress ? JSON.parse(order.progress) : { currentStage: '', updates: [] };
        
        // Update progress
        progress.currentStage = stage;
        progress.updates.push({
            stage,
            description,
            images: images || [],
            timestamp: new Date().toISOString()
        });

        await dbHelper.run(
            'UPDATE orders SET progress = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [JSON.stringify(progress), req.params.id]
        );

        const updatedOrder = await dbHelper.get(
            'SELECT * FROM orders WHERE id = ?',
            [req.params.id]
        );

        res.status(200).json({
            status: 'success',
            data: updatedOrder
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add order note
// @route   POST /api/orders/:id/notes
// @access  Private
const addOrderNote = async (req, res, next) => {
    try {
        const { note } = req.body;

        const order = await dbHelper.get(
            'SELECT * FROM orders WHERE id = ?',
            [req.params.id]
        );

        if (!order) {
            return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
        }

        // Parse existing progress or create new
        let progress = order.progress ? JSON.parse(order.progress) : { currentStage: '', updates: [] };
        
        // Add note
        progress.updates.push({
            stage: 'note',
            description: note,
            timestamp: new Date().toISOString()
        });

        await dbHelper.run(
            'UPDATE orders SET progress = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [JSON.stringify(progress), req.params.id]
        );

        const updatedOrder = await dbHelper.get(
            'SELECT * FROM orders WHERE id = ?',
            [req.params.id]
        );

        res.status(200).json({
            status: 'success',
            data: updatedOrder
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats/overview
// @access  Private
const getOrderStats = async (req, res, next) => {
    try {
        const stats = await dbHelper.get(`
            SELECT 
                COUNT(*) as totalOrders,
                SUM(CAST(JSON_EXTRACT(pricing, '$.totalAmount') AS INTEGER)) as totalRevenue,
                AVG(CAST(JSON_EXTRACT(pricing, '$.totalAmount') AS INTEGER)) as averageOrderValue,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingOrders,
                SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as inProgressOrders,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedOrders
            FROM orders
        `);

        res.status(200).json({
            status: 'success',
            data: stats || {
                totalOrders: 0,
                totalRevenue: 0,
                averageOrderValue: 0,
                pendingOrders: 0,
                inProgressOrders: 0,
                completedOrders: 0
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    updateOrderProgress,
    addOrderNote,
    getOrderStats
}; 