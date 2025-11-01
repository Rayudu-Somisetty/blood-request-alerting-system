const express = require('express');
const router = express.Router();

// Controllers
const {
  register,
  login,
  logout,
  getMe,
  updatePassword
} = require('../controllers/authController');

// Middleware
const { protect } = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  updatePasswordValidation,
  handleValidationErrors
} = require('../middleware/validation');

// @desc    Register a new admin user
// @route   POST /api/auth/register
// @access  Public (for initial setup) / Private (for creating new admins)
router.post('/register', registerValidation, handleValidationErrors, register);

// @desc    Login admin user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginValidation, handleValidationErrors, login);

// @desc    Get current logged in admin
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, getMe);

// @desc    Logout admin user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, logout);

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
router.put('/updatepassword', protect, updatePasswordValidation, handleValidationErrors, updatePassword);

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
router.post('/refresh', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is still valid',
    data: {
      user: req.user
    }
  });
});

module.exports = router;