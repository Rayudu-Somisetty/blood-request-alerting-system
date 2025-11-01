/**
 * Email OTP Service with EmailJS Integration
 * Free alternative to Firebase Phone Authentication
 * Uses EmailJS for real email delivery (200 emails/month free)
 */

import emailjs from '@emailjs/browser';

// EmailJS Configuration
// Get these from https://www.emailjs.com/
const EMAILJS_CONFIG = {
  serviceId: 'service_x6w0we1',  // Replace with your EmailJS Service ID
  templateId: 'template_1zjk4wx',        // Replace with your EmailJS Template ID
  publicKey: 'tN0UVFVmqTlsBKk5J'       // Replace with your EmailJS Public Key
};

class EmailOtpService {
  constructor() {
    this.otpStore = new Map(); // Store OTPs temporarily
    this.otpExpiry = 10 * 60 * 1000; // 10 minutes
    this.initialized = false;
  }

  /**
   * Initialize EmailJS
   */
  init() {
    if (!this.initialized) {
      emailjs.init(EMAILJS_CONFIG.publicKey);
      this.initialized = true;
    }
  }

  /**
   * Generate a 6-digit OTP
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Store OTP with expiry
   */
  storeOTP(email, otp) {
    const expiryTime = Date.now() + this.otpExpiry;
    this.otpStore.set(email.toLowerCase(), {
      otp,
      expiry: expiryTime,
      attempts: 0
    });
  }

  /**
   * Send OTP to email using EmailJS
   */
  async sendOTP(email) {
    let otp = null;
    
    try {
      this.init();
      
      otp = this.generateOTP();
      this.storeOTP(email, otp);
      
      // For development - show OTP in console
      console.log('🔐 OTP Generated:', otp);
      console.log('📧 Sending to:', email);
      
      // Try multiple template variable formats to match EmailJS template
      const templateParams = {
        // Common variable names
        to_email: email,
        user_email: email,
        email: email,
        to_name: email.split('@')[0],
        user_name: email.split('@')[0],
        name: email.split('@')[0],
        otp_code: otp,
        otp: otp,
        code: otp,
        verification_code: otp,
        expiry_minutes: '10',
        expiry: '10',
        message: `Your OTP is: ${otp}`,
        subject: 'Your OTP for Blood Alert Registration'
      };
      
      console.log('📤 Sending email with params:', templateParams);
      
      try {
        await emailjs.send(
          EMAILJS_CONFIG.serviceId,
          EMAILJS_CONFIG.templateId,
          templateParams
        );
        
        console.log('✅ OTP email sent successfully');
        
        // Also show alert for backup
        alert(`✅ OTP Sent!\n\nAn OTP has been sent to:\n${email}\n\nYour OTP: ${otp}\n\n(Also check your email inbox)`);
        
        return {
          success: true,
          message: 'OTP sent to your email'
        };
      } catch (emailError) {
        console.error('EmailJS send error:', emailError);
        throw emailError;
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      console.error('Error details:', error.text || error.message);
      
      // Show OTP in alert as fallback
      alert(`⚠️ Email Delivery Issue\n\nYour OTP: ${otp}\n\nPlease use this OTP to continue.\n\nNote: Email delivery failed, but you can still register using the OTP above.`);
      
      return {
        success: true,
        message: 'OTP generated (please check the alert)'
      };
    }
  }

  /**
   * Verify OTP
   */
  verifyOTP(email, enteredOtp) {
    try {
      const emailKey = email.toLowerCase();
      const storedData = this.otpStore.get(emailKey);

      if (!storedData) {
        return {
          success: false,
          error: 'No OTP found. Please request a new OTP.'
        };
      }

      // Check expiry
      if (Date.now() > storedData.expiry) {
        this.otpStore.delete(emailKey);
        return {
          success: false,
          error: 'OTP has expired. Please request a new OTP.'
        };
      }

      // Check attempts
      if (storedData.attempts >= 3) {
        this.otpStore.delete(emailKey);
        return {
          success: false,
          error: 'Too many incorrect attempts. Please request a new OTP.'
        };
      }

      // Verify OTP
      if (storedData.otp === enteredOtp) {
        this.otpStore.delete(emailKey);
        return {
          success: true,
          message: 'OTP verified successfully'
        };
      } else {
        storedData.attempts++;
        return {
          success: false,
          error: `Incorrect OTP. ${3 - storedData.attempts} attempts remaining.`
        };
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Clear OTP data
   */
  clearOTP(email) {
    this.otpStore.delete(email.toLowerCase());
  }

  /**
   * Check if OTP can be resent
   */
  canResendOTP(email) {
    const storedData = this.otpStore.get(email.toLowerCase());
    if (!storedData) return true;
    
    // Allow resend after 1 minute
    const timeSinceGeneration = Date.now() - (storedData.expiry - this.otpExpiry);
    return timeSinceGeneration > 60000; // 1 minute
  }
}

// Create singleton instance
const emailOtpService = new EmailOtpService();
export default emailOtpService;
