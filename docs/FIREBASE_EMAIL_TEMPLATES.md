# Firebase email branding

Firebase Authentication sends the password-reset and email-verification messages. Configure their sender name and templates in the Firebase console:

1. Open **Firebase Console** → your project → **Authentication** → **Templates**.
2. Select **Password reset** and set the sender name to `Blood Request Alerting System`.
3. Select **Email address verification** and set the sender name to `Blood Request Alerting System`.
4. Edit each subject/body as desired, keeping Firebase's reset/verification action link placeholder in the template.
5. In **Authentication** → **Settings** → **Authorized domains**, add the deployed site domain (for example, your Vercel domain) before testing the links in production.

The application calls Firebase's `sendPasswordResetEmail` and `sendEmailVerification`, so these console templates are used automatically after saving.
