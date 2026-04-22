// utils/email.js — Send OTP via Email (Nodemailer + Gmail)
const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password (not your main password)
    },
  });
};

const sendOtpEmail = async (to, name, otp) => {
  const transporter = createTransporter();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #6B7FD4, #9B59B6); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; letter-spacing: -0.5px; }
        .header p { color: rgba(255,255,255,0.8); margin: 5px 0 0; font-size: 14px; }
        .body { padding: 30px; }
        .otp-box { background: #f8f7ff; border: 2px dashed #6B7FD4; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp { font-size: 40px; font-weight: 700; letter-spacing: 10px; color: #6B7FD4; }
        .note { color: #666; font-size: 13px; margin-top: 5px; }
        .footer { background: #f8f7ff; padding: 20px; text-align: center; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💙 HelpBuddy</h1>
          <p>Your safe space to talk</p>
        </div>
        <div class="body">
          <p>Hi <strong>${name}</strong>,</p>
          <p>Here's your one-time password (OTP) to access HelpBuddy:</p>
          <div class="otp-box">
            <div class="otp">${otp}</div>
            <div class="note">⏰ Valid for 10 minutes only</div>
          </div>
          <p>If you didn't request this OTP, please ignore this email — your account is safe.</p>
          <p>Remember: <strong>HelpBuddy staff will NEVER ask for your OTP.</strong></p>
        </div>
        <div class="footer">
          <p>You're taking a brave step by reaching out. We're here for you. 💙</p>
          <p>HelpBuddy — Anonymous Mental Health Support</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `${otp} — Your HelpBuddy OTP`,
    html,
  });
};

module.exports = { sendOtpEmail };
