import nodemailer from 'nodemailer';
// const clgDev = require('./clgDev');

const sendMail = async (toEmail, subject, body) => {
  try {
    // Validate email
    if (!toEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)) {
      throw new Error("Invalid email address");
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
    console.error("Email sending error:", err.message);
    return { success: false, error: err.message };
  }
};

export default sendMail;