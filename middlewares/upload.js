const s3storage = require('../services/s3.service');

const uploadAvatar = (req, res, next) => {
  s3storage.single('avatar')(req, res, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    return next();
  });
};

module.exports = {
  uploadAvatar
};
