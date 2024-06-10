require("dotenv").config();
const nodemailer = require('nodemailer');
const emailConfig = require("../config/email.config")
const EMAIL_USER = emailConfig.ADMIN_EMAIL;
const EMAIL_PASS = emailConfig.ADMIN_EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

exports.sendEmail = (to, subject, html) => {
  return transporter.sendMail({
    to,
    subject,
    html,
  });
};
