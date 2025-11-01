const { body, param, query, validationResult } = require('express-validator');

// Common validation rules
const emailValidation = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address');

const passwordValidation = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number');

const phoneValidation = body('phone')
  .isMobilePhone('en-IN')
  .withMessage('Please provide a valid Indian phone number');

// Auth validation rules
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  emailValidation,
  phoneValidation,
  passwordValidation,
  
  body('role')
    .optional()
    .isIn(['super_admin', 'admin', 'staff'])
    .withMessage('Invalid role specified')
];

const loginValidation = [
  emailValidation,
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updatePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

// User validation rules
const createUserValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  emailValidation,
  phoneValidation,
  
  body('userType')
    .isIn(['donor', 'patient'])
    .withMessage('User type must be either donor or patient'),
  
  body('bloodGroup')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Please provide a valid blood group')
];

// Donation validation rules
const createDonationValidation = [
  body('donor')
    .isMongoId()
    .withMessage('Please provide a valid donor ID'),
  
  body('donorDetails.bloodGroup')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Please provide a valid blood group'),
  
  body('donorDetails.age')
    .isInt({ min: 18, max: 65 })
    .withMessage('Donor age must be between 18 and 65')
];

// Parameter validation
const mongoIdValidation = param('id')
  .isMongoId()
  .withMessage('Please provide a valid ID');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// PUBLIC FORM VALIDATION RULES

// Validation for public donation requests
const validateDonationRequest = [
  body('donorName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Donor name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number'),
  
  body('bloodType')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Please select a valid blood type'),
  
  body('preferredDate')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid date'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must be less than 200 characters'),
  
  body('medicalConditions')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Medical conditions description must be less than 500 characters'),
  
  body('consentGiven')
    .isBoolean()
    .withMessage('Consent must be given'),
  
  handleValidationErrors
];

// Validation for public user registration
const validateUserRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  emailValidation,
  phoneValidation,
  
  body('bloodGroup')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Please select a valid blood group'),
  
  body('dateOfBirth')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid date of birth'),
  
  body('address.street')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Street address must be between 5 and 100 characters'),
  
  body('address.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  
  body('address.state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  
  body('address.pincode')
    .isPostalCode('IN')
    .withMessage('Please provide a valid Indian pincode'),
  
  body('emergencyContact.name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Emergency contact name must be between 2 and 50 characters'),
  
  body('emergencyContact.phone')
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid emergency contact phone number'),
  
  body('consentGiven')
    .isBoolean()
    .withMessage('Consent must be given'),
  
  handleValidationErrors
];

module.exports = {
  registerValidation,
  loginValidation,
  updatePasswordValidation,
  createUserValidation,
  createDonationValidation,
  mongoIdValidation,
  handleValidationErrors,
  validateDonationRequest,
  validateUserRegistration
};