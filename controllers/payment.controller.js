const _ = require("lodash");

const config = require("../config");
const stripe = require("../config/stripe");
const { db } = require("../config/firebase");

const getInfo = async (req, res) => {
  const { invoice_settings } = req.customer;
  const { stripeAccountId } = req.user;
  const { default_payment_method: defaultPaymentMethod } = invoice_settings;
  const response = {
    card: null,
    bank: null,
  };

  // ============= get credit card info =============
  if (defaultPaymentMethod) {
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(
        defaultPaymentMethod
      );

      response.card = _.pick(
        paymentMethod.card,
        "brand",
        "exp_month",
        "exp_year",
        "last4"
      );
    } catch (e) {
      console.error(e);
    }
  }
  // ================================================

  // ================ get bank info =================
  if (stripeAccountId) {
    try {
      const bankAccount = await stripe.accounts.retrieveExternalAccount(
        config.STRIPE_CONNECT_ACCOUND_ID,
        stripeAccountId
      );

      response.bank = _.pick(bankAccount, "bank_name", "last4");
    } catch (e) {
      console.error(e);
    }
  }
  // ================================================

  return res.status(200).json(response);
};

const addCard = async (req, res) => {
  const { paymentMethodId } = req.body;

  const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
    customer: req.customer.id,
  });
  await stripe.customers.update(req.customer.id, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });

  return res
    .status(200)
    .json(
      _.pick(paymentMethod.card, "brand", "exp_month", "exp_year", "last4")
    );
};

const addBankAccount = async (req, res) => {
  const { token } = req.body;
  const { stripeAccountId } = req.user;

  if (stripeAccountId) {
    // delete old bank account
    try {
      await stripe.accounts.deleteExternalAccount(
        config.STRIPE_CONNECT_ACCOUND_ID,
        stripeAccountId
      );
    } catch (e) {
      console.error(e);
    }
  }

  const bankAccount = await stripe.accounts.createExternalAccount(
    config.STRIPE_CONNECT_ACCOUND_ID,
    { external_account: token }
  );
  await req.userDoc.update({
    stripeAccountId: bankAccount.id,
  });

  return res.status(200).json(_.pick(bankAccount, "bank_name", "last4"));
};

const giveTip = async (req, res) => {
  const { uid, amount } = req.body;
  const { invoice_settings } = req.customer;

  const userDoc = db.collection("users").doc(uid);
  const user = await userDoc.get();

  if (!user.exists) {
    return res.status(400).send({ message: "Bad Request" });
  }

  await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: "usd",
    confirm: true,
    customer: req.customer.id,
    payment_method: invoice_settings?.default_payment_method,
  });

  // charge balance of user in firestore
  await userDoc.update({
    balance: (user.data().balance || 0) + amount * 0.8,
  });

  return res.status(200).json({ success: true });
};

const payPerView = async (req, res) => {
  const { contentId } = req.body;
  const { invoice_settings } = req.customer;

  const contentDoc = db.collection("videos").doc(contentId);
  const content = await contentDoc.get();
  if (!content.exists) {
    return res.status(400).send({ message: "Bad Request" });
  }

  const ownerDoc = db.collection("users").doc(content.data().uid);
  const owner = await ownerDoc.get();
  if (!owner.exists) {
    return res.status(500).send({ message: "Internal Server Error" });
  }

  // charge in stripe
  await stripe.paymentIntents.create({
    amount: content.data().price * 100,
    currency: "usd",
    confirm: true,
    customer: req.customer.id,
    payment_method: invoice_settings?.default_payment_method,
  });

  // charge balance of owner in firestore
  await ownerDoc.update({
    balance: owner.data().balance + content.data().price * 0.8,
  });

  return res.status(200).json({ success: true });
};

const changeSubscribeStatus = async (req, res) => {
  const { uid, status } = req.body;
  const { stripeCustomerId } = req.user;

  const targetUserDoc = db.collection("users").doc(uid);
  const targetUser = await targetUserDoc.get();

  if (!targetUser.exists) {
    return res
      .status(400)
      .send({ message: "Bad request: User does not exist" });
  }

  const subscribedInfo = await db
    .collection("subscriptions")
    .where("from", "==", req.user.uid)
    .where("to", "==", uid)
    .get();

  if (!subscribedInfo.empty && status === "true") {
    return res.status(200).json({ success: true });
  }
  if (subscribedInfo.empty && status === "false") {
    return res.status(200).json({ success: true });
  }

  if (status === "true") {
    // subscribe
    if (!targetUser.data().priceId) {
      await db.collection("subscriptions").add({
        from: req.user.uid,
        to: uid,
      });
    } else {
      // create subscription
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: targetUser.data().priceId }],
        metadata: { userId: req.user.uid, targetUserId: targetUser.data().uid },
        cancel_at_period_end: false,
        payment_behavior: "error_if_incomplete",
        collection_method: "charge_automatically",
      });

      await db.collection("subscriptions").add({
        from: req.user.uid,
        to: uid,
        subscriptionId: subscription.id,
      });
    }
  } else {
    // unsubscribe
    const records = [];
    const batch = db.batch();

    subscribedInfo.forEach((el) => {
      records.push(el.data());
      batch.delete(el.ref);
    });

    await Promise.all(
      records.map(async (el) => {
        if (el.subscriptionId) {
          await stripe.subscriptions.del(el.subscriptionId);
        }
      })
    );
    await batch.commit();
  }

  return res.status(200).json({ success: true });
};

const withDraw = async (req, res) => {
  const { stripeAccountId } = req.user;
  const amount = Number(req.body.amount);
  const balance = Number(req.user.balance) || 0;
  const pendingBalance = Number(req.user.pendingBalance) || 0;

  if (!stripeAccountId || amount > balance) {
    return res.status(400).json({ message: "Bad Request" });
  }

  await stripe.payouts.create(
    {
      amount: amount * 100,
      currency: "aud",
      destination: stripeAccountId,
      metadata: { userId: req.user.uid },
    },
    { stripeAccount: config.STRIPE_CONNECT_ACCOUND_ID }
  );

  // reduce balance of user in firestore
  await req.userDoc.update({
    balance: balance - amount,
    pendingBalance: pendingBalance + amount,
  });

  return res.status(200).json({ success: true });
};

const setSubscriptionFee = async (req, res) => {
  const { uid, name, priceId } = req.user;
  const amount = Number(req.body.amount);
  const subscribers = [];
  const subscribersInfo = await db
    .collection("subscriptions")
    .where("to", "==", uid)
    .get();

  if (!subscribersInfo.empty) {
    subscribersInfo.forEach((el) => {
      subscribers.push({
        ref: el.ref,
        data: el.data(),
      });
    });
  }

  if (amount > 0) {
    let productId = req.user.productId;
    if (!productId) {
      const product = await stripe.products.create({ name });
      productId = product.id;
    }

    const price = await stripe.prices.create({
      unit_amount: amount * 100,
      currency: "usd",
      recurring: { interval: "month" },
      product: productId,
    });

    if (priceId) {
      // change price of all subscriptions
      await Promise.all(
        subscribers.map(async (el) => {
          const { subscriptionId } = el.data;

          if (subscriptionId) {
            // update existing subscription
            const subscription = await stripe.subscriptions.retrieve(
              subscriptionId
            );
            stripe.subscriptions.update(subscriptionId, {
              cancel_at_period_end: false,
              proration_behavior: "none",
              items: [
                {
                  id: subscription.items.data[0].id,
                  price: price.id,
                },
              ],
            });
          } else {
            // send notification and unsubscribe
            await el.ref.delete();
          }
        })
      );
    } else {
      // send notification and unsubscribe
      const batch = db.batch();
      subscribersInfo.forEach((el) => {
        batch.delete(el.ref);
      });
      await batch.commit();
    }

    await req.userDoc.update({
      productId,
      priceId: price.id,
      subscriptionFee: `${amount} usd`,
    });
  } else {
    const batch = db.batch();

    // cancel all subscriptions
    await Promise.all(
      subscribers.map(async (el) => {
        const { subscriptionId } = el.data;

        if (subscriptionId) {
          await stripe.subscriptions.del(subscriptionId);
          batch.update(el.ref, { subscriptionId: null });
        }
      })
    );

    await batch.commit();
    await req.userDoc.update({
      priceId: null,
      subscriptionFee: "",
    });
  }

  return res.status(200).json({ success: true });
};

const accountHook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    // On error, log and return the error message
    console.log(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const data = event.data.object;
  console.log("Webhook type: ", event.type);
  console.log("Webhook data: ", data);

  switch (event.type) {
    case "invoice.payment_action_required":
    case "invoice.payment_failed":
      if (data.lines?.data?.[0]?.metadata) {
        const { userId, targetUserId } = data.lines.data[0].metadata;

        if (userId && targetUserId) {
          const subscribedInfo = await db
            .collection("subscriptions")
            .where("from", "==", userId)
            .where("to", "==", targetUserId)
            .get();

          if (!subscribedInfo.empty) {
            const batch = db.batch();

            subscribedInfo.forEach((el) => {
              batch.delete(el.ref);
            });

            await batch.commit();
          }
        }
      }
      break;
    case "invoice.paid":
      const { amount_paid } = data;

      if (data.lines?.data?.[0]?.metadata) {
        const { userId, targetUserId } = data.lines.data[0].metadata;

        if (userId && targetUserId) {
          const targetUserDoc = db.collection("users").doc(targetUserId);
          const targetUser = await targetUserDoc.get();
          const balance = Number(targetUser.data().balance) || 0;

          if (targetUser.exists) {
            await targetUserDoc.update({
              balance: balance + (amount_paid / 100) * 0.8,
            });
          }
        }
      }
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  return res.json({ received: true });
};

const connectHook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.STRIPE_CONNECT_WEBHOOK_SECRET
    );
  } catch (err) {
    // On error, log and return the error message
    console.log(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const data = event.data.object;
  console.log("Webhook type: ", event.type);
  console.log("Webhook data: ", data);

  switch (event.type) {
    case "payout.canceled":
    case "payout.failed":
      // get userId and move payout amount from pending to balance
      if (data.metadata?.userId) {
        const { amount } = data;
        const { userId } = data.metadata;

        const userDoc = db.collection("users").doc(userId);
        const user = await userDoc.get();
        const balance = Number(user.data().balance) || 0;
        const pendingBalance = Number(user.data().pendingBalance) || 0;

        if (user.exists) {
          await userDoc.update({
            balance: balance + amount / 100,
            pendingBalance: Math.max(pendingBalance - amount / 100, 0),
          });
        }
      }
      break;
    case "payout.paid":
      if (data.metadata?.userId) {
        // get userId and subtract payout amount from pending
        const { amount } = data;
        const { userId } = data.metadata;

        const userDoc = db.collection("users").doc(userId);
        const user = await userDoc.get();
        const pendingBalance = Number(user.data().pendingBalance) || 0;

        if (user.exists) {
          await userDoc.update({
            pendingBalance: Math.max(pendingBalance - amount / 100, 0),
          });
        }
      }
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  return res.json({ received: true });
};

module.exports = {
  getInfo,
  addCard,
  addBankAccount,
  giveTip,
  payPerView,
  changeSubscribeStatus,
  withDraw,
  setSubscriptionFee,
  accountHook,
  connectHook,
};
