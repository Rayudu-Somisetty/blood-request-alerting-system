# EmailJS Setup Guide - FREE Email OTP System

## 🎯 What You Get
- ✅ **200 FREE emails per month**
- ✅ Real email delivery
- ✅ No backend required
- ✅ Professional email templates
- ✅ Works directly from React

## 📝 Step-by-Step Setup (5 minutes)

### Step 1: Create EmailJS Account

1. Go to **https://www.emailjs.com/**
2. Click **"Sign Up"**
3. Sign up with your email (Google sign-in works too)
4. Verify your email address

### Step 2: Add Email Service

1. After login, go to **Email Services**
2. Click **"Add New Service"**
3. Choose your email provider:
   - **Gmail** (Recommended for testing)
   - Outlook
   - Yahoo
   - Or any SMTP service

4. For Gmail:
   - Click "Connect Account"
   - Sign in with your Gmail
   - Allow EmailJS access
   - Give your service a name (e.g., "Blood Alert")

5. Click **"Create Service"**
6. **Copy the Service ID** (e.g., `service_abc123`)

### Step 3: Create Email Template

1. Go to **Email Templates**
2. Click **"Create New Template"**
3. Set template name: `OTP Verification`
4. Use this template:

```html
Subject: Your OTP for Blood Alert Registration

Hi {{to_name}},

Your One-Time Password (OTP) for Blood Alert registration is:

OTP: {{otp_code}}

This OTP is valid for {{expiry_minutes}} minutes.

If you didn't request this OTP, please ignore this email.

Best regards,
Blood Alert Team
```

5. **Template Variables to use**:
   - `{{to_name}}` - Recipient name
   - `{{to_email}}` - Recipient email
   - `{{otp_code}}` - The 6-digit OTP
   - `{{expiry_minutes}}` - Expiry time

6. Click **"Save"**
7. **Copy the Template ID** (e.g., `template_xyz789`)

### Step 4: Get Public Key

1. Go to **Account** → **General**
2. Find **Public Key** section
3. **Copy your Public Key** (e.g., `Abc123XyZ456`)

### Step 5: Update Your Code

Open `src/services/emailOtpService.js` and update:

```javascript
const EMAILJS_CONFIG = {
  serviceId: 'service_abc123',    // Your Service ID from Step 2
  templateId: 'template_xyz789',   // Your Template ID from Step 3
  publicKey: 'Abc123XyZ456'        // Your Public Key from Step 4
};
```

### Step 6: Test It!

1. Start your app: `npm start`
2. Go to registration page
3. Enter your email
4. Click "Register"
5. **Check your inbox** - you should receive an OTP email!
6. Enter the OTP and verify

## 📧 Gmail App Password (If Using Gmail)

If you're using Gmail and 2FA is enabled:

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already)
3. Go to **App Passwords**
4. Create new app password for "Mail"
5. Use this in EmailJS Gmail service setup

## 🎨 Customize Email Template (Optional)

Make your emails look professional:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
    .header { text-align: center; color: #dc3545; }
    .otp-box { background: #f8f9fa; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🩸 Blood Alert</h1>
      <h2>Email Verification</h2>
    </div>
    
    <p>Hi {{to_name}},</p>
    
    <p>Thank you for registering with Blood Alert. Please use the OTP below to complete your registration:</p>
    
    <div class="otp-box">
      {{otp_code}}
    </div>
    
    <p>This OTP is valid for <strong>{{expiry_minutes}} minutes</strong>.</p>
    
    <p>If you didn't request this OTP, please ignore this email.</p>
    
    <div class="footer">
      <p>© 2025 Blood Alert. All rights reserved.</p>
      <p>Be a life saver. Donate blood.</p>
    </div>
  </div>
</body>
</html>
```

## 🔒 Security Best Practices

### ✅ DO:
- Keep your EmailJS keys in environment variables (production)
- Use rate limiting on registration
- Monitor your EmailJS usage
- Set email templates to "Private"

### ❌ DON'T:
- Share your EmailJS keys publicly
- Commit keys to GitHub
- Exceed free tier limits (200/month)

## 💰 Cost Breakdown

### Free Tier (Current):
- ✅ 200 emails/month
- ✅ 2 email services
- ✅ Unlimited templates
- ✅ Email support

### If You Need More:
- **Personal**: $7/month - 1,000 emails
- **Professional**: $20/month - 10,000 emails
- **Enterprise**: $90/month - 100,000 emails

## 🐛 Troubleshooting

### Problem: "User not found" error
**Solution**: Make sure you connected your Gmail properly in Step 2

### Problem: Emails going to spam
**Solution**: 
1. Use a custom domain email (not Gmail)
2. Add SPF/DKIM records
3. Or ask users to check spam folder initially

### Problem: "Service is not available"
**Solution**: Check your EmailJS service status and quotas

### Problem: Template variables not working
**Solution**: Make sure variable names match exactly: `{{otp_code}}` not `{{OTP_CODE}}`

## 🚀 Production Checklist

Before going live:

- [ ] EmailJS account created
- [ ] Email service connected
- [ ] Template created and tested
- [ ] Public key added to code
- [ ] Tested with real email address
- [ ] Spam folder checked
- [ ] Email template looks good on mobile
- [ ] Monitor EmailJS usage dashboard

## 📊 Monitor Usage

1. Go to EmailJS Dashboard
2. Check **Statistics** tab
3. Monitor:
   - Emails sent today
   - Success rate
   - Remaining quota

## 🆘 Need Help?

- EmailJS Docs: https://www.emailjs.com/docs/
- EmailJS Support: support@emailjs.com
- Test your setup in EmailJS dashboard before production

---

## ✅ Quick Start Summary

1. Sign up at emailjs.com
2. Connect Gmail service
3. Create OTP template
4. Copy 3 keys (Service ID, Template ID, Public Key)
5. Update `emailOtpService.js`
6. Test registration!

**Setup time: ~5 minutes**  
**Cost: $0 (200 emails/month free)**

---

**Status**: Ready to implement! Just follow the steps above. 🎉
