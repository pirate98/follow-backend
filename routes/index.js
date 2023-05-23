const express = require('express');
const authRoutes = require('./auth.route');
const usersRoutes = require('./users.route');
const paymentRoutes = require('./payment.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/users',
    route: usersRoutes,
  },
  {
    path: '/payment',
    route: paymentRoutes,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
