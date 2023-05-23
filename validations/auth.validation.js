const joi = require('joi');

const validatePassword = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message('password must be at least 8 characters');
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message(
      'password must contain at least 1 letter and 1 number',
    );
  }
  return value;
};

const register = {
  body: joi.object().keys({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required().custom(validatePassword),
  }),
};

const login = {
  body: joi.object().keys({
    email: joi.string().email().required(),
    password: joi.string().required(),
  }),
};

const forgotPassword = {
  body: joi.object().keys({
    email: joi.string().email().required(),
  }),
}

const resetPassword = {
  body: joi.object().keys({
    token: joi.string().required(),
    password: joi.string().required().custom(validatePassword),
  }),
}

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword
};
