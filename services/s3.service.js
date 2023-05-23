const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const config = require('../config');

const s3Client = new S3Client({
  credentials: {
    accessKeyId: config.S3_ACCESS_KEY_ID,
    secretAccessKey: config.S3_SECRET_KEY,
  },
  region: config.S3_REGION
});

const s3storage = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: config.S3_BUCKET_NAME,
    contentType: function (req, file, cb) {
      cb(null, 'image/png');
    }
  }),
  limits: { fileSize: 72351744 } // 69MB
});

module.exports = s3storage;
