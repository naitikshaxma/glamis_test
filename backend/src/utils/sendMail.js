import nodemailer from 'nodemailer';
// const clgDev = require('./clgDev');

const sendMail = async (toEmail, subject, body) => {
  try {
    // Validate email
    if (!toEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)) {
      throw new Error("Invalid email address");
    }

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
      from: process.env.SMTP_FROM_NAME || `GLAMIS <${process.env.SMTP_EMAIL}>`,
      to: toEmail,
      subject: subject,
      html: body,
    });

    return { success: true, info };
  } catch (err) {
    // clgDev(err.message);
    console.error(`[EMAIL ERROR] Failed to send email to ${toEmail}:`, err.message);
    return { success: false, error: err.message };
  }
};

export default sendMail;