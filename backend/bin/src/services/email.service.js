const nodemailer = require('nodemailer');
require('dotenv').config();

const useEmail = process.env.EMAIL_USER && process.env.EMAIL_USER !== 'mock_smtp_user';

let transporter;

if (useEmail) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT) || 2525,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
} else {
  console.log('SMTP credentials missing or default. Email service initialized in console mock mode.');
}

const sendEmail = async ({ to, subject, text, html }) => {
  if (useEmail) {
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'no-reply@telehealthpro.com',
        to,
        subject,
        text,
        html
      });
      console.log(`Email sent successfully: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('SMTP email delivery failure:', error);
      // We do not throw to prevent breaking payment or booking flows if email is misconfigured
      return null;
    }
  } else {
    console.log('=== [MOCK EMAIL DISPATCH] ===');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text:    ${text}`);
    console.log('=============================');
    return { mockSent: true };
  }
};

module.exports = {
  sendEmail
};
