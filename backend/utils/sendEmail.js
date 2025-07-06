const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        // Check if email configuration is available
        if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('Email configuration not found. Skipping email send.');
            return;
        }

        // Create transporter
        const transporter = nodemailer.createTransporter({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Define email options
        const message = {
            from: `${process.env.FROM_NAME || 'Busy Canvas'} <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html || options.message
        };

        // Send email
        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Email sending failed:', error.message);
        // Don't throw error to prevent breaking the application
    }
};

module.exports = sendEmail; 