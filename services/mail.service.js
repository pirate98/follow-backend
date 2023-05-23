const nodemailer = require('nodemailer');
const config = require('../config');

const transporter = nodemailer.createTransport({
  host: config.MAIL_SMTP_HOST,
  port: config.MAIL_SMTP_PORT,
  auth: {
    user: config.MAIL_SMTP_USER,
    pass: config.MAIL_SMTP_PASS
  },
  debug: true,
  logger: true
});

async function sendMail(options) {
  const from = `"${config.MAIL_SENDER_NAME}" <${config.MAIL_SENDER_ADDRESS}>`;

  try {
    const info = await transporter.sendMail({ from, ...options });
  
    if (info.rejected.length) {
      throw new Error(`E-mails got rejected: ${info.rejected.join(', ')}`);
    }

    return info;
  } catch (err) {
    console.error(err);
  }
}

const mailService = () => {
  const sendForgotPasswordEmail = async (to, token) => {
    const options = {
      to: to,
      subject: "Reset your password",
      html: `<h3>click on the link below to reset your password</h3><p>${config.APP_URL}?token=${token}</p>`
    };
  
    return await sendMail(options);
  };

  return {
    sendForgotPasswordEmail
  };
}

module.exports = mailService;
