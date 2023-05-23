const stripe = require('../config/stripe');

module.exports = async (req, res, next) => {
  const { email } = req.user;

  const customers = await stripe.customers.search({
    query: `email:'${email}'`,
  });

  try {
    if (!customers.data.length) {
      req.customer = await stripe.customers.create({ email });
    } else {
      req.customer = customers.data[0];
    }

    if (req.user.stripeCustomerId !== req.customer.id) {
      await req.userDoc.update({
        stripeCustomerId: req.customer.id
      });
    }
  } catch(err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  return next();
};
