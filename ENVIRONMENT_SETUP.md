# Environment Variables Setup Guide

## Overview
This project uses environment variables to securely store sensitive configuration data like Firebase credentials. This ensures that secrets are not committed to version control.

## Setup Instructions

### 1. Create Environment File
Copy the `.env.example` file to create your own `.env` file:

```bash
cp .env.example .env
```

### 2. Configure Firebase Credentials
Open the `.env` file and replace the placeholder values with your actual Firebase project credentials:

```env
REACT_APP_FIREBASE_API_KEY=your_actual_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_actual_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_actual_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_actual_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_actual_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_actual_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_actual_measurement_id
```

### 3. Get Firebase Credentials
To get your Firebase credentials:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on the gear icon (⚙️) → Project settings
4. Scroll down to "Your apps" section
5. Select your web app or create a new one
6. Copy the configuration values to your `.env` file

### 4. Restart Development Server
After creating or modifying the `.env` file, restart your development server:

```bash
npm start
```

## Important Notes

### Security
- **NEVER** commit the `.env` file to version control
- The `.env` file is already listed in `.gitignore`
- Only commit `.env.example` with placeholder values
- Do not share your `.env` file or credentials publicly

### Environment Variables in React
- All React environment variables must start with `REACT_APP_`
- Environment variables are embedded at build time
- Changes to `.env` require a server restart

### Production Deployment
For production deployments:
- Set environment variables in your hosting platform (Vercel, Netlify, etc.)
- Do not use the `.env` file in production
- Each platform has its own method for setting environment variables

#### Vercel
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable with its value

#### Netlify
1. Go to Site settings → Build & deploy → Environment
2. Add environment variables

#### Firebase Hosting
Use `firebase functions:config:set`:
```bash
firebase functions:config:set firebase.api_key="your_key"
```

## Troubleshooting

### Environment Variables Not Loading
1. Ensure the `.env` file is in the root directory
2. Verify all variables start with `REACT_APP_`
3. Restart the development server
4. Check for typos in variable names

### Build Errors
If you get undefined errors:
1. Check that all required variables are set in `.env`
2. Verify the variable names match exactly
3. Ensure no extra spaces in the `.env` file

## Files Modified
The following files now use environment variables:
- `src/firebase/config.js` - Main Firebase configuration
- `src/firebase/initDatabase.js` - Database initialization script

## Backup Files
The following backup files contain hardcoded credentials and are now gitignored:
- `src/firebase/config_backup.js`
- `src/firebase/config_new.js`

These files should be deleted or kept only for local reference.
