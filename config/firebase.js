const admin = require('firebase-admin');

const parseServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const json = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
    return JSON.parse(json);
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  return null;
};

const initializeFirebase = () => {
  if (admin.apps.length) {
    return admin.app();
  }

  const serviceAccount = parseServiceAccount();

  if (!serviceAccount) {
    console.warn(
      '⚠️  Firebase Admin is not configured. Protected Firebase routes will fail until env vars are added.'
        .yellow
    );
    return null;
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
};

const getFirebaseAdmin = () => {
  if (!admin.apps.length) {
    initializeFirebase();
  }

  if (!admin.apps.length) {
    throw new Error('Firebase Admin is not configured');
  }

  return admin;
};

module.exports = {
  initializeFirebase,
  getFirebaseAdmin,
};
