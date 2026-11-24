const nodemailer = require('nodemailer');

/**
 * Send an email using SMTP or fall back to console logging in development.
 *
 * Why we create the transporter each time:
 *   - For a college project the volume is tiny, so there's no performance hit.
 *   - It keeps the code simple — no connection-pool management to worry about.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  // If SMTP credentials are provided, send through configured mail server
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection configuration before attempting to send
    try {
      await transporter.verify();
      console.log('[Email] SMTP connection verified ✓');
    } catch (verifyErr) {
      console.error('[Email] SMTP connection FAILED:', verifyErr.message);
      throw new Error(
        'Email service is currently unavailable. Please try again later.'
      );
    }

    const info = await transporter.sendMail({
      from:
        process.env.SMTP_FROM ||
        `"Student Attendance Tracker" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || '',
      html: html || '',
    });

    console.log(`[Email Sent] Message ID: ${info.messageId} → ${to}`);
    return info;
  }

  // Developer fallback: Log OTP to console when SMTP is not configured in .env
  console.log('\n============================================================');
  console.log('📬 EMAIL SERVICE (DEVELOPMENT MODE)');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Content:\n', text || html);
  console.log('============================================================\n');

  return { devMode: true };
};

module.exports = sendEmail;
