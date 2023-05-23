const express = require('express');

const validate = require('../middlewares/validate');
const { authController } = require('../controllers');
const { authValidation } = require('../validations');

const router = express.Router();

router.post(
  '/sign-in',
  validate(authValidation.login),
  authController.login,
);
router.post(
  '/sign-up',
  validate(authValidation.register),
  authController.register,
);

router.put(
  '/forgot-password',
  validate(authValidation.forgotPassword),
  authController.forgotPassword,
);

router.put(
  '/reset-password',
  validate(authValidation.resetPassword),
  authController.resetPassword,
);

module.exports = router;
