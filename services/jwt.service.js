const jwt = require('jsonwebtoken');
const config = require('../config');

const expiresIn = 2592000;
const secret = config.JWT_SECRET;

const jwtService = () => {
  const sign = (payload) => jwt.sign(payload, secret);
  const issue = (payload) => jwt.sign(payload, secret, { expiresIn });
  const revoke = (token) => jwt.destroy(token, secret);
  const verify = (token) => jwt.verify(token, secret);
  const decode = (token) => jwt.decode(token);

  const generatePasswordResetToken = async (userId) => {
    const token = await jwt.sign({
      kind: "password-reset",
      sub: userId,
    }, secret, { expiresIn: 5 * 60 });
  
    return token;
  };

  return {
    sign,
    issue,
    verify,
    revoke,
    decode,
    generatePasswordResetToken,
  };
};

module.exports = jwtService;