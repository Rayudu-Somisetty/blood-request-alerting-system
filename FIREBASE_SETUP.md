# Firebase Integration Setup Guide for Blood Alert

## Overview
This guide will help you set up Google Firebase as the backend database for the Blood Alert blood request alerting system, replacing the existing Prisma/SQLite setup.

## Prerequisites
- Node.js and npm installed
- Google account for Firebase
- Firebase CLI (optional, for deployment)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "blood-alert")
4. Enable Google Analytics (optional)
5. Select or create a Google Analytics account
6. Click "Create project"

## Step 2: Configure Firebase Services

### Authentication Setup
1. In Firebase Console, go to "Authentication" → "Get started"
2. Go to "Sign-in method" tab
3. Enable "Email/Password" provider
4. Optionally enable other providers (Google, Phone, etc.)

### Firestore Database Setup
1. Go to "Firestore Database" → "Create database"
2. Choose "Start in test mode" (we'll apply security rules later)
3. Select a location closest to your users (e.g., asia-south1 for India)

### Storage Setup (Optional)
1. Go to "Storage" → "Get started"
2. Choose "Start in test mode"
3. Select the same location as Firestore

## Step 3: Get Firebase Configuration

1. Go to "Project settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" → Web icon (</>)
4. Register app with name "Blood Alert"
5. Copy the Firebase configuration object

## Step 4: Update Firebase Configuration

Replace the placeholder values in `src/firebase/config.js` with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id",
  measurementId: "your-actual-measurement-id"
};
```

## Step 5: Deploy Security Rules

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize project: `firebase init`
   - Select Firestore and Storage
   - Choose existing project
   - Accept default files (firestore.rules, storage.rules)
4. Deploy rules: `firebase deploy --only firestore:rules,storage:rules`

## Step 6: Initialize Database (Optional)

To populate the database with sample data:

1. Update the Firebase config in `src/firebase/initDatabase.js`
2. Run the initialization script from your app
3. This will create sample users, blood requests, and donations

## Step 7: Test the Integration

1. Start your React app: `npm start`
2. Go to the Admin Setup page: http://localhost:3000/admin-setup
3. Click "Create Admin User" to create the admin account
4. Try logging in with the admin account:
   - Email: admin@bloodalert.com
   - Password: admin123
5. Test user registration: http://localhost:3000/register
6. Create a new user account and test login functionality

## Step 8: Production Deployment

### Option 1: Firebase Hosting
1. Build your app: `npm run build`
2. Initialize hosting: `firebase init hosting`
3. Deploy: `firebase deploy --only hosting`

### Option 2: Other Hosting Providers
- Build your app: `npm run build`
- Upload the `build` folder contents to your hosting provider

## Database Schema

The Firebase Firestore database uses the following collections:

### Users Collection
- **Path**: `/users/{userId}`
- **Fields**: firstName, lastName, email, phone, bloodGroup, role, userType, etc.

### Donations Collection
- **Path**: `/donations/{donationId}`
- **Fields**: donorId, donationType, donationDate, status, etc.

### Blood Requests Collection
- **Path**: `/bloodRequests/{requestId}`
- **Fields**: patientName, bloodGroup, unitsRequired, urgency, status, etc.

### Components Collection (Admin)
- **Path**: `/components/{componentId}`
- **Fields**: componentType, quantity, expiryDate, etc.

### Documents Collection
- **Path**: `/documents/{documentId}`
- **Fields**: userId, documentType, fileName, uploadDate, etc.

### Notes Collection (Admin)
- **Path**: `/notes/{noteId}`
- **Fields**: title, content, createdBy, createdAt, etc.

## Security Rules

The project includes comprehensive security rules that:
- Allow users to read/write their own data
- Restrict admin-only operations
- Ensure proper authentication for all operations
- Protect sensitive data from unauthorized access

## Environment Variables (Recommended)

For production, consider using environment variables for Firebase config:

1. Create `.env` file:
```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

2. Update `src/firebase/config.js` to use environment variables

## Troubleshooting

### Common Issues:
1. **"Firebase not initialized"**: Check config.js for correct Firebase configuration
2. **Authentication errors**: Verify Email/Password provider is enabled
3. **Permission denied**: Check Firestore security rules
4. **CORS errors**: Ensure Firebase project settings allow your domain

### Support:
- Firebase Documentation: https://firebase.google.com/docs
- Firebase Support: https://firebase.google.com/support

## Migration from Prisma/SQLite

If you have existing data in Prisma/SQLite:
1. Export data using Prisma Studio or custom scripts
2. Transform data to Firestore format
3. Use Firebase Admin SDK to bulk import data
4. Test data integrity after migration

## Next Steps

1. Set up monitoring and analytics
2. Configure email verification
3. Add push notifications (optional)
4. Set up automated backups
5. Monitor database usage and costs

This completes the Firebase integration setup. Your Blood Alert blood bank management system now uses Firebase as the backend database with real-time capabilities, scalability, and robust security.
