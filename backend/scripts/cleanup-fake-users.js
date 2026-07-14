/**
 * Cleanup Script: Remove Fake @bloodalert.internal Firebase Auth Accounts
 * =========================================================================
 * This script deletes all Firebase Authentication accounts that were created
 * with the old fake-email scheme (username@bloodalert.internal).
 *
 * It also deletes the matching Firestore user documents.
 *
 * Usage:
 *   cd backend
 *   node scripts/cleanup-fake-users.js
 *
 * Safe to run multiple times (idempotent).
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const admin = require('firebase-admin');
const path = require('path');

// ──────────────────────────────────────────────────────────────────────────────
// Initialize Firebase Admin
// ──────────────────────────────────────────────────────────────────────────────
function initFirebase() {
  if (admin.apps.length > 0) return;

  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    serviceAccount = require(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH));
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } else {
    serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        : undefined,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    };
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });

  console.log('🔥 Firebase Admin SDK initialized');
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/** Fetch all Firebase Auth users in batches */
async function getAllAuthUsers() {
  const auth = admin.auth();
  const users = [];
  let pageToken;

  do {
    const listResult = await auth.listUsers(1000, pageToken);
    users.push(...listResult.users);
    pageToken = listResult.pageToken;
  } while (pageToken);

  return users;
}

/** Delete a Firebase Auth user by uid */
async function deleteAuthUser(uid) {
  await admin.auth().deleteUser(uid);
}

/** Delete a Firestore /users/{uid} document if it exists */
async function deleteFirestoreUser(uid) {
  const db = admin.firestore();
  const ref = db.collection('users').doc(uid);
  const snap = await ref.get();
  if (snap.exists) {
    await ref.delete();
    return true;
  }
  return false;
}

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────
async function main() {
  initFirebase();

  console.log('\n🔍 Scanning Firebase Auth for fake @bloodalert.internal accounts...\n');

  const allUsers = await getAllAuthUsers();
  const fakeUsers = allUsers.filter(u =>
    u.email && u.email.toLowerCase().endsWith('@bloodalert.internal')
  );

  if (fakeUsers.length === 0) {
    console.log('✅ No fake accounts found. Nothing to clean up.');
    process.exit(0);
  }

  console.log(`Found ${fakeUsers.length} account(s) to delete:\n`);
  fakeUsers.forEach(u => {
    console.log(`  • ${u.email}  (uid: ${u.uid})`);
  });

  console.log('\n⚠️  This will permanently delete these accounts from Firebase Auth AND Firestore.');
  console.log('   Press Ctrl+C within 5 seconds to cancel...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  let authDeleted = 0;
  let firestoreDeleted = 0;
  const errors = [];

  for (const user of fakeUsers) {
    try {
      // Delete from Firebase Auth
      await deleteAuthUser(user.uid);
      authDeleted++;
      console.log(`  🗑️  Deleted Auth account: ${user.email}`);

      // Delete from Firestore
      const didDelete = await deleteFirestoreUser(user.uid);
      if (didDelete) {
        firestoreDeleted++;
        console.log(`       ↳ Deleted Firestore document: users/${user.uid}`);
      } else {
        console.log(`       ↳ No Firestore document found for uid: ${user.uid}`);
      }
    } catch (err) {
      console.error(`  ❌ Failed to delete ${user.email}: ${err.message}`);
      errors.push({ email: user.email, error: err.message });
    }
  }

  console.log('\n──────────────────────────────────────');
  console.log(`✅ Cleanup complete!`);
  console.log(`   Firebase Auth accounts deleted : ${authDeleted}`);
  console.log(`   Firestore documents deleted    : ${firestoreDeleted}`);
  if (errors.length > 0) {
    console.log(`   Errors                         : ${errors.length}`);
    errors.forEach(e => console.log(`     • ${e.email}: ${e.error}`));
  }
  console.log('──────────────────────────────────────\n');

  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
