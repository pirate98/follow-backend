const express = require('express');

const auth = require('../middlewares/firebase.auth');
const validateStripeCustomer = require('../middlewares/stripe');
const validate = require('../middlewares/validate');
const { paymentController } = require('../controllers');
const { paymentValidation } = require('../validations');

const router = express.Router();

router.get(
  '/',
  [auth, validateStripeCustomer],
  paymentController.getInfo,
);

router.post(
  '/card',
  [auth, validateStripeCustomer, validate(paymentValidation.addCard)],
  paymentController.addCard,
);

router.post(
  '/bank',
  [auth, validateStripeCustomer, validate(paymentValidation.addBank)],
  paymentController.addBankAccount,
);

router.post(
  '/tip',
  [auth, validateStripeCustomer, validate(paymentValidation.giveTip)],
  paymentController.giveTip,
);

router.post(
  '/pay-per-view',
  [auth, validateStripeCustomer, validate(paymentValidation.payPerView)],
  paymentController.payPerView,
);

router.put(
  '/subscribe-status',
  [auth, validateStripeCustomer, validate(paymentValidation.changeSubscribeStatus)],
  paymentController.changeSubscribeStatus,
);

router.post(
  '/withdraw',
  [auth, validateStripeCustomer, validate(paymentValidation.withDraw)],
  paymentController.withDraw,
);

router.put(
  '/subscription-fee',
  [auth, validateStripeCustomer, validate(paymentValidation.setSubscriptionFee)],
  paymentController.setSubscriptionFee,
);
  
router.post('/account-hook', paymentController.accountHook);
router.post('/connect-hook', paymentController.connectHook);

module.exports = router;
