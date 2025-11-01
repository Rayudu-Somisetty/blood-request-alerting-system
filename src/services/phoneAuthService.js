import { 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  linkWithCredential,
  PhoneAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase/config';
import firebaseService from '../firebase/firebaseService';

class PhoneAuthService {
  constructor() {
    this.recaptchaVerifier = null;
    this.confirmationResult = null;
  }

  /**
   * Initialize reCAPTCHA verifier for phone authentication
   * @param {string} containerId - The ID of the container element for reCAPTCHA
   * @param {Object} callbacks - Optional callbacks for success/error
   */
  initializeRecaptcha(containerId = 'recaptcha-container', callbacks = {}) {
    try {
      // Clear existing verifier
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear();
      }

      this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'normal',
        callback: (response) => {
          console.log('reCAPTCHA verified successfully');
          if (callbacks.onSuccess) callbacks.onSuccess(response);
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          if (callbacks.onExpired) callbacks.onExpired();
        },
        'error-callback': (error) => {
          console.error('reCAPTCHA error:', error);
          if (callbacks.onError) callbacks.onError(error);
        }
      });

      return this.recaptchaVerifier;
    } catch (error) {
      console.error('Error initializing reCAPTCHA:', error);
      throw new Error('Failed to initialize phone verification. Please refresh and try again.');
    }
  }

  /**
   * Format phone number to international format
   * @param {string} phoneNumber - Phone number to format
   * @param {string} countryCode - Country code (default: '+91' for India)
   */
  formatPhoneNumber(phoneNumber, countryCode = '+91') {
    // Remove any non-digit characters
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // If phone already starts with country code, return as is
    if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
      return '+' + cleanPhone;
    }
    
    // If 10-digit Indian number, add country code
    if (cleanPhone.length === 10) {
      return countryCode + cleanPhone;
    }
    
    // If already formatted, return as is
    if (phoneNumber.startsWith('+')) {
      return phoneNumber;
    }
    
    throw new Error('Invalid phone number format. Please enter a valid 10-digit phone number.');
  }

  /**
   * Send OTP to the provided phone number
   * @param {string} phoneNumber - Phone number to send OTP to
   * @returns {Promise<Object>} - Success/error response
   */
  async sendOTP(phoneNumber) {
    try {
      if (!this.recaptchaVerifier) {
        throw new Error('Please complete the reCAPTCHA verification first.');
      }

      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      console.log('Sending OTP to:', formattedPhone);

      // Store the phone number for resend functionality
      this.lastPhoneNumber = formattedPhone;

      this.confirmationResult = await signInWithPhoneNumber(
        auth, 
        formattedPhone, 
        this.recaptchaVerifier
      );

      return {
        success: true,
        message: `OTP sent successfully to ${formattedPhone}`,
        verificationId: this.confirmationResult.verificationId
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      
      // Clear reCAPTCHA on error
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear();
        this.recaptchaVerifier = null;
      }

      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number. Please check the number and try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (error.code === 'auth/captcha-check-failed') {
        errorMessage = 'reCAPTCHA verification failed. Please try again.';
      }

      return {
        success: false,
        error: errorMessage,
        code: error.code
      };
    }
  }

  /**
   * Verify the OTP entered by user
   * @param {string} otp - The OTP code entered by user
   * @returns {Promise<Object>} - Success/error response with user data
   */
  async verifyOTP(otp) {
    try {
      if (!this.confirmationResult) {
        throw new Error('No OTP session found. Please request a new OTP.');
      }

      const result = await this.confirmationResult.confirm(otp);
      const user = result.user;

      console.log('Phone verification successful:', user.uid);

      return {
        success: true,
        message: 'Phone number verified successfully!',
        user: {
          uid: user.uid,
          phoneNumber: user.phoneNumber,
          isNewUser: result.user.metadata.creationTime === result.user.metadata.lastSignInTime
        }
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);

      let errorMessage = 'Invalid OTP. Please check the code and try again.';
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid verification code. Please enter the correct OTP.';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'OTP has expired. Please request a new code.';
      }

      return {
        success: false,
        error: errorMessage,
        code: error.code
      };
    }
  }

  /**
   * Register new user with phone number and additional profile data
   * @param {string} otp - The OTP code
   * @param {Object} profileData - Additional user profile information
   * @returns {Promise<Object>} - Registration result
   */
  async registerWithPhone(otp, profileData) {
    try {
      // First verify the OTP
      const verificationResult = await this.verifyOTP(otp);
      
      if (!verificationResult.success) {
        return verificationResult;
      }

      const phoneUser = verificationResult.user;

      // If this is a new user, save their profile data
      if (phoneUser.isNewUser) {
        const userProfile = {
          ...profileData,
          uid: phoneUser.uid,
          phoneNumber: phoneUser.phoneNumber,
          phoneVerified: true,
          authMethod: 'phone',
          createdAt: new Date(),
          lastLoginAt: new Date()
        };

        // Save user profile to Firestore
        await firebaseService.createUserProfile(phoneUser.uid, userProfile);

        return {
          success: true,
          message: 'Registration completed successfully!',
          user: userProfile,
          isNewUser: true
        };
      } else {
        // Existing user, just update login time
        await firebaseService.updateUserLastLogin(phoneUser.uid);
        const existingProfile = await firebaseService.getUserProfile(phoneUser.uid);

        return {
          success: true,
          message: 'Welcome back! Phone verification successful.',
          user: existingProfile,
          isNewUser: false
        };
      }
    } catch (error) {
      console.error('Error in phone registration:', error);
      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.'
      };
    }
  }

  /**
   * Link phone number to existing email account
   * @param {string} otp - The OTP code
   * @returns {Promise<Object>} - Link result
   */
  async linkPhoneToAccount(otp) {
    try {
      if (!this.confirmationResult) {
        throw new Error('No OTP session found. Please request a new OTP.');
      }

      const credential = PhoneAuthProvider.credential(
        this.confirmationResult.verificationId,
        otp
      );

      const result = await linkWithCredential(auth.currentUser, credential);

      return {
        success: true,
        message: 'Phone number linked to your account successfully!',
        user: result.user
      };
    } catch (error) {
      console.error('Error linking phone to account:', error);

      let errorMessage = 'Failed to link phone number. Please try again.';
      
      if (error.code === 'auth/credential-already-in-use') {
        errorMessage = 'This phone number is already associated with another account.';
      } else if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid verification code. Please enter the correct OTP.';
      }

      return {
        success: false,
        error: errorMessage,
        code: error.code
      };
    }
  }

  /**
   * Resend OTP to the same phone number
   * @returns {Promise<Object>} - Resend result
   */
  async resendOTP() {
    try {
      if (!this.lastPhoneNumber) {
        throw new Error('No phone number found. Please start the verification process again.');
      }

      // Reinitialize reCAPTCHA
      this.initializeRecaptcha();
      
      // Send OTP again
      return await this.sendOTP(this.lastPhoneNumber);
    } catch (error) {
      console.error('Error resending OTP:', error);
      return {
        success: false,
        error: 'Failed to resend OTP. Please try again.'
      };
    }
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
    this.confirmationResult = null;
    this.lastPhoneNumber = null;
  }

  /**
   * Check if phone authentication is supported
   * @returns {boolean} - Whether phone auth is supported
   */
  isPhoneAuthSupported() {
    return typeof window !== 'undefined' && 'RecaptchaVerifier' in window;
  }
}

// Export singleton instance
const phoneAuthService = new PhoneAuthService();
export default phoneAuthService;