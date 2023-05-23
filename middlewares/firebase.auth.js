const { auth, db } = require('../config/firebase');

module.exports = async (req, res, next) => {
  if (req.header('Authorization')) {
    try {
      const decodedToken = await auth.verifyIdToken(req.header('Authorization'));

      if (decodedToken.email_verified) {
        const userDoc = db.collection('users').doc(decodedToken.uid);
        const user = await userDoc.get();

        if (user.exists) {
          req.userDoc = userDoc;
          req.user = user.data();

          return next();
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  return res.status(401).json({
    message: 'Not authorized'
  });
};
