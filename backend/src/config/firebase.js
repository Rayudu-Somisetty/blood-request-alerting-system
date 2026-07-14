const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Try to load service account from file
    let serviceAccount;
    
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      // Load from file path
      serviceAccount = require(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH));
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      // Load from environment variable (JSON string)
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } else {
      // Fallback: construct from individual environment variables
      serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs'
      };
    }

    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });

    console.log('🔥 Firebase Admin initialized successfully');
    
    // Get Firestore and Auth instances
    const db = admin.firestore();
    const auth = admin.auth();

    return { admin, db, auth };
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    console.log('⚠️ Make sure Firebase credentials are configured in .env');
    throw error;
  }
};

// Initialize Firebase
const { admin: adminSDK, db, auth } = initializeFirebase();

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await admin.app().delete();
    console.log('🔌 Firebase connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error during Firebase cleanup:', err);
    process.exit(1);
  }
});

module.exports = {
  admin: adminSDK,
  db,
  auth
};
