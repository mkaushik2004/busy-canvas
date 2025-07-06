const { dbHelper } = require('../database/database');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res, next) => {
    try {
        const { name, email, phone, subject, message, category } = req.body;

        // Create contact entry
        const result = await dbHelper.run(
            `INSERT INTO contact (name, email, phone, subject, message, category, userAgent, ipAddress) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, email, phone, subject, message, category || 'general', req.get('User-Agent'), req.ip]
        );

        // Get created contact
        const contact = await dbHelper.get(
            'SELECT * FROM contact WHERE id = ?',
            [result.id]
        );

        // Send notification email to admin
        const adminMessage = `
            New contact form submission:
            
            Name: ${name}
            Email: ${email}
            Phone: ${phone}
            Subject: ${subject}
            Category: ${category || 'general'}
            Message: ${message}
            
            Submitted at: ${new Date().toLocaleString()}
        `;

        try {
            await sendEmail({
                email: process.env.EMAIL_USER,
                subject: `New Contact Form Submission: ${subject}`,
                message: adminMessage
            });
        } catch (emailError) {
            console.error('Failed to send admin notification email:', emailError);
        }

        // Send confirmation email to user
        const userMessage = `
            Dear ${name},
            
            Thank you for contacting Busy Canvas. We have received your message and will get back to you within 24-48 hours.
            
            Your message details:
            Subject: ${subject}
            Message: ${message}
            
            If you have any urgent inquiries, please call us at +91 98765 43210.
            
            Best regards,
            Busy Canvas Team
        `;

        try {
            await sendEmail({
                email: email,
                subject: 'Thank you for contacting Busy Canvas',
                message: userMessage
            });
        } catch (emailError) {
            console.error('Failed to send user confirmation email:', emailError);
        }

        res.status(201).json({
            status: 'success',
            message: 'Contact form submitted successfully. We will get back to you soon.',
            data: {
                id: contact.id,
                name: contact.name,
                email: contact.email,
                subject: contact.subject
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all contact submissions (admin only)
// @route   GET /api/contact
// @access  Private/Admin
const getContacts = async (req, res, next) => {
    try {
        const contacts = await dbHelper.all(
            'SELECT * FROM contact ORDER BY createdAt DESC'
        );

        res.status(200).json({
            status: 'success',
            count: contacts.length,
            data: contacts
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single contact submission
// @route   GET /api/contact/:id
// @access  Private/Admin
const getContact = async (req, res, next) => {
    try {
        const contact = await dbHelper.get(
            'SELECT * FROM contact WHERE id = ?',
            [req.params.id]
        );

        if (!contact) {
            return next(new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404));
        }

        res.status(200).json({
            status: 'success',
            data: contact
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update contact status
// @route   PUT /api/contact/:id/status
// @access  Private/Admin
const updateContactStatus = async (req, res, next) => {
    try {
        const { status, priority, assignedTo } = req.body;

        const result = await dbHelper.run(
            'UPDATE contact SET status = ?, priority = ?, assignedTo = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [status, priority, assignedTo, req.params.id]
        );

        if (result.changes === 0) {
            return next(new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404));
        }

        const contact = await dbHelper.get(
            'SELECT * FROM contact WHERE id = ?',
            [req.params.id]
        );

        res.status(200).json({
            status: 'success',
            data: contact
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Respond to contact
// @route   POST /api/contact/:id/respond
// @access  Private/Admin
const respondToContact = async (req, res, next) => {
    try {
        const { response } = req.body;

        const contact = await dbHelper.get(
            'SELECT * FROM contact WHERE id = ?',
            [req.params.id]
        );

        if (!contact) {
            return next(new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404));
        }

        // Update contact with response
        await dbHelper.run(
            'UPDATE contact SET response = ?, respondedBy = ?, respondedAt = CURRENT_TIMESTAMP, status = "responded", updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [response, req.user.id, req.params.id]
        );

        // Send response email to user
        const userMessage = `
            Dear ${contact.name},
            
            Thank you for contacting Busy Canvas. Here is our response to your inquiry:
            
            Your original message:
            Subject: ${contact.subject}
            Message: ${contact.message}
            
            Our response:
            ${response}
            
            If you have any further questions, please don't hesitate to contact us.
            
            Best regards,
            Busy Canvas Team
        `;

        try {
            await sendEmail({
                email: contact.email,
                subject: `Re: ${contact.subject} - Busy Canvas`,
                message: userMessage
            });
        } catch (emailError) {
            console.error('Failed to send response email:', emailError);
            return next(new ErrorResponse('Failed to send response email', 500));
        }

        const updatedContact = await dbHelper.get(
            'SELECT * FROM contact WHERE id = ?',
            [req.params.id]
        );

        res.status(200).json({
            status: 'success',
            message: 'Response sent successfully',
            data: updatedContact
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete contact submission
// @route   DELETE /api/contact/:id
// @access  Private/Admin
const deleteContact = async (req, res, next) => {
    try {
        const contact = await dbHelper.get(
            'SELECT * FROM contact WHERE id = ?',
            [req.params.id]
        );

        if (!contact) {
            return next(new ErrorResponse(`Contact not found with id of ${req.params.id}`, 404));
        }

        await dbHelper.run(
            'DELETE FROM contact WHERE id = ?',
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

// @desc    Get contact statistics
// @route   GET /api/contact/stats
// @access  Private/Admin
const getContactStats = async (req, res, next) => {
    try {
        const stats = await dbHelper.get(`
            SELECT 
                COUNT(*) as totalContacts,
                SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as newContacts,
                SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as inProgressContacts,
                SUM(CASE WHEN status = 'responded' THEN 1 ELSE 0 END) as respondedContacts,
                SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as highPriorityContacts,
                SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as mediumPriorityContacts,
                SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as lowPriorityContacts
            FROM contact
        `);

        res.status(200).json({
            status: 'success',
            data: stats || {
                totalContacts: 0,
                newContacts: 0,
                inProgressContacts: 0,
                respondedContacts: 0,
                highPriorityContacts: 0,
                mediumPriorityContacts: 0,
                lowPriorityContacts: 0
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    submitContact,
    getContacts,
    getContact,
    updateContactStatus,
    respondToContact,
    deleteContact,
    getContactStats
}; 