const joi = require('joi');

const addCard = {
  body: joi.object().keys({
    paymentMethodId: joi.string().required(),
  }),
};

const addBank = {
  body: joi.object().keys({
    token: joi.string().required(),
  }),
};

const giveTip = {
  body: joi.object().keys({
    uid: joi.string().required(),
    amount: joi.number().min(1).max(300).required(),
  }),
};

const payPerView = {
  body: joi.object().keys({
    contentId: joi.string().required(),
  }),
};

const changeSubscribeStatus = {
  body: joi.object().keys({
    uid: joi.string().required(),
    status: joi.boolean().required(),
  }),
};

const withDraw = {
  body: joi.object().keys({
    amount: joi.number().min(1).required(),
  }),
};

const setSubscriptionFee = {
  body: joi.object().keys({
    amount: joi.number().required(),
  }),
};

module.exports = {
  addCard,
  addBank,
  giveTip,
  payPerView,
  changeSubscribeStatus,
  withDraw,
  setSubscriptionFee,
};
