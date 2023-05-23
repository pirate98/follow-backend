const admin = require('firebase-admin');
const serviceAccount = require('./firebase.json');

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://follow-mvp.firebaseio.com'
});

module.exports = {
  auth: app.auth(),
  db: app.firestore(),
};
