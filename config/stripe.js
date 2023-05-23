const Stripe = require('stripe');
const config = require('../config');

/** @type {import("stripe").Stripe} */
const stripe = new Stripe(config.STRIPE_SECRET_KEY);

module.exports = stripe;