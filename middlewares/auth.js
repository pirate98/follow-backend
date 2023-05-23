const { Users } = require('../models');
const { jwtService } = require('../services');

module.exports = async (req, res, next) => {
  if (req.header('Authorization')) {
    const parts = req.header('Authorization').split(' ');

    if (parts.length === 2) {
      if (/^Bearer$/.test(parts[0])) {
        try {
          const decoded = await jwtService().verify(parts[1]);
          const user = await Users.findByPk(decoded.jti);

          if (user) {
            req.user = user;
            return next();
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  return res.status(401).json({
    message: 'Not authorized'
  });
};