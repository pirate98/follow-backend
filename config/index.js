const dotenv = require('dotenv');
const path = require('path');

const NODE_ENV = process.env.NODE_ENV || 'development';

dotenv.config({
  path: path.resolve(__dirname, '..', NODE_ENV + '.env')
});

module.exports = {
  NODE_ENV,
  APP_URL: process.env.APP_URL,
  PORT: process.env.PORT || '3000',
  SESSION_SECRET: process.env.SESSION_SECRET || 'session_secret',
  JWT_SECRET: process.env.JWT_SECRET || 'jwt_secret',
  MAIL_SMTP_HOST: process.env.MAIL_SMTP_HOST,
  MAIL_SMTP_PORT: process.env.MAIL_SMTP_PORT,
  MAIL_SMTP_USER: process.env.MAIL_SMTP_USER,
  MAIL_SMTP_PASS: process.env.MAIL_SMTP_PASS,
  MAIL_SENDER_NAME: process.env.MAIL_SENDER_NAME,
  MAIL_SENDER_ADDRESS: process.env.MAIL_SENDER_ADDRESS,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_KEY: process.env.S3_SECRET_KEY,
  S3_REGION: process.env.S3_REGION,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  STRIPE_CONNECT_ACCOUND_ID: process.env.STRIPE_CONNECT_ACCOUND_ID,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_CONNECT_WEBHOOK_SECRET: process.env.STRIPE_CONNECT_WEBHOOK_SECRET,
};