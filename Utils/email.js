const nodemailer = require('nodemailer');

// Function to send email
const sendEmail = async (options) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Define email options
    const emailOptions = {
        from: 'SkillCorp@company.com', // Sender's email address
        to: options.email, // Recipient's email address
        subject: options.subject, // Email subject
        text: options.message // Email body
    };

    // Send email
    await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;
