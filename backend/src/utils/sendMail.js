const nodemailer = require('nodemailer');
// const clgDev = require('./clgDev');

const sendMail = async (toEmail, subject, body) => {
  try {
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
      from: `Tanishq Soni`,
      to: toEmail,
      subject: subject,
      html: body,
    });

    return info;
  } catch (err) {
    // clgDev(err.message);
    throw err;
  }
};

module.exports = sendMail;