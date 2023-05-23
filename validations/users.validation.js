const joi = require('joi');

const update = {
  body: joi.object().keys({
    gender: joi.string().valid('M', 'F').optional(),
    location: joi.string().optional(),
    birthday: joi.string().optional(),
    bio: joi.string().optional(),
  }),
};

const updateFollowStatus = {
  body: joi.object().keys({
    userId: joi.number().required(),
    status: joi.boolean().required(),
  }),
};

module.exports = {
  update,
  updateFollowStatus,
};
