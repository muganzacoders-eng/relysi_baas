const nodemailer = require('nodemailer');
const { FRONTEND_URL } = require('../config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

exports.sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;
  
  await transporter.sendMail({
    from: '"Education Support" <no-reply@educationsupport.com>',
    to: email,
    subject: 'Verify Your Email',
    html: `
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link will expire in 24 hours.</p>
    `
  });
};

exports.sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  
  await transporter.sendMail({
    from: '"Education Support" <no-reply@educationsupport.com>',
    to: email,
    subject: 'Password Reset Request',
    html: `
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
    `
  });
};

exports.sendNotificationEmail = async (email, subject, message) => {
  await transporter.sendMail({
    from: '"Education Support" <notifications@educationsupport.com>',
    to: email,
    subject,
    html: message
  });
};