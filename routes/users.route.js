const express = require('express');

const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { uploadAvatar } = require('../middlewares/upload');
const { usersController } = require('../controllers');
const { usersValidation } = require('../validations');

const router = express.Router();

router.put(
  '/',
  [auth, uploadAvatar, validate(usersValidation.update)],
  usersController.update,
);

router.put(
  '/follow-status',
  [auth, validate(usersValidation.updateFollowStatus)],
  usersController.updateFollowStatus,
);

router.get(
  '/:id/followings',
  usersController.getUserFollowings,
);

router.get(
  '/:id/followers',
  usersController.getUserFollowers,
);

router.get(
  '/:id',
  usersController.getUserById,
);

module.exports = router;
