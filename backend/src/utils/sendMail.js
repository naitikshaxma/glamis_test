import nodemailer from 'nodemailer';
// const clgDev = require('./clgDev');

const sendMail = async (toEmail, subject, body) => {
  try {
    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      console.log(`\n\n=== [DEV MODE] EMAIL INTERCEPTED ===`);
      console.log(`To: ${toEmail}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body (Contains OTP):\n${body}`);
      console.log(`====================================\n\n`);
      return { messageId: 'dev-mode-no-email' };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // send mail
    const info = await transporter.sendMail({
      from: `GLAMIS`,
      to: toEmail,
      subject: subject,
      html: body,
    });

    return info;
  } catch (err) {
    // clgDev(err.message);
    console.error(`[EMAIL ERROR] Failed to send email to ${toEmail}:`, err.message);
    // Don't throw in development - just log the error
    return null;
  }
};

export default sendMail;