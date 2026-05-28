const User = require('../models/User');
const { getFirebaseAdmin } = require('../config/firebase');

const requireFirebaseAuth = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization || '';
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).send({
        success: false,
        error: 'Firebase ID token is required',
      });
    }

    const admin = getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };

    req.currentUser = await User.syncFromFirebase(req.firebaseUser);

    if (!req.currentUser || req.currentUser.isActive === false) {
      return res.status(403).send({
        success: false,
        error: 'User account is disabled',
      });
    }

    next();
  } catch (error) {
    res.status(401).send({
      success: false,
      error: error.message || 'Invalid Firebase ID token',
    });
  }
};

module.exports = requireFirebaseAuth;
