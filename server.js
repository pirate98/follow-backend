const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('express-async-errors');
const Sequelize = require('sequelize');

const config = require('./config');
const dbConfig = require('./config/database.json')[config.NODE_ENV];
const routes = require('./routes');

const app = express();
const server = require('http').createServer(app);

app.use(express.urlencoded({ extended: true }));
app.use('/payment/account-hook', express.raw({ type: 'application/json' }));
app.use('/payment/connect-hook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '5mb' }));

app.use(session({ 
  secret: config.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}));

if (config.NODE_ENV === 'production') {
  app.use(cors());
} else {
  app.use(cors({ origin: '*' }));
}

app.use(express.static('public'));
app.use('/', routes);

// ===== handling routes ======

// Global error handler
app.use((err, req, res, next) => { 
  console.error(err);

  return res.status(500).json({
    message: config.NODE_ENV === 'production' ? 'Internal Server Error' : err.toString()
  });
});

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect
  }
);

async function startServer() {
  server.listen(config.PORT, async () => {
    const port = server.address().port;
    console.log('Listening at port: ', port);
    server.keepAliveTimeout = 65000;  // Ensure all inactive connections are terminated by the ALB, by setting this a few seconds higher than the ALB idle timeout
    server.headersTimeout = 66000;    // Ensure the headersTimeout is set higher than the keepAliveTimeout due to this nodejs regression bug: https://github.com/nodejs/node/issues/27363
    console.log('server.keepAliveTimeout: ', server.keepAliveTimeout);
    console.log('server.headersTimeout: ', server.headersTimeout);
  });
}

sequelize.authenticate().then(startServer).catch((error) => {
  console.error('Unable to connect to the database: ', error);
});
