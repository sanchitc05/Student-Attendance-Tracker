/**
 * Quick SMTP connection test — run from server/ directory:
 *   node testEmail.js
 *
 * It will:
 *   1. Verify SMTP connection
 *   2. Send a test email to your own SMTP_USER address
 */
require('dotenv').config();
const nodemailer = require('nodemailer');

(async () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  console.log('\n--- SMTP Configuration ---');
  console.log('Host :', SMTP_HOST || '(not set)');
  console.log('Port :', SMTP_PORT || '(not set)');
  console.log('User :', SMTP_USER || '(not set)');
  console.log('Pass :', SMTP_PASS ? '****' + SMTP_PASS.slice(-4) : '(not set)');
  console.log('From :', SMTP_FROM || '(not set, will default to SMTP_USER)');

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error('\n❌ SMTP credentials are missing in .env — cannot test.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  console.log('\n1️⃣  Verifying SMTP connection...');
  try {
    await transporter.verify();
    console.log('   ✅ SMTP connection OK\n');
  } catch (err) {
    console.error('   ❌ SMTP connection FAILED:', err.message);
    console.error('   Full error:', err);
    process.exit(1);
  }

  console.log('2️⃣  Sending test email to', SMTP_USER, '...');
  try {
    const info = await transporter.sendMail({
      from: SMTP_FROM || `"Test" <${SMTP_USER}>`,
      to: SMTP_USER,
      subject: '✅ Attendance Tracker — SMTP Test',
      text: 'If you are reading this, your email configuration is working correctly!',
      html: `
        <div style="font-family: Arial; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2>✅ SMTP Test Successful</h2>
          <p>If you are reading this, your email configuration is working correctly!</p>
          <p style="color:#64748b; font-size:13px;">Sent at: ${new Date().toISOString()}</p>
        </div>
      `,
    });
    console.log('   ✅ Email sent! Message ID:', info.messageId);
    console.log('   📬 Check your inbox at:', SMTP_USER);
  } catch (err) {
    console.error('   ❌ Failed to send:', err.message);
    console.error('   Full error:', err);
    process.exit(1);
  }

  console.log('\n--- Done ---\n');
  process.exit(0);
})();
