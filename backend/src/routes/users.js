const express = require('express');
const router = express.Router();

// Controllers
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats
} = require('../controllers/userController');

// Middleware
const { protect, isAdmin } = require('../middleware/auth');
const {
  createUserValidation,
  mongoIdValidation,
  handleValidationErrors
} = require('../middleware/validation');

// Apply authentication and admin check to all routes
router.use(protect);
router.use(isAdmin);

// @desc    Get dashboard statistics
// @route   GET /api/users/stats
// @access  Private (Admin only)
router.get('/stats', getUserStats);

// @desc    Get all users with pagination and filtering
// @route   GET /api/users
// @access  Private (Admin only)
router.get('/', getUsers);

// @desc    Create new user (donor/patient)
// @route   POST /api/users
// @access  Private (Admin only)
router.post('/', createUserValidation, handleValidationErrors, createUser);

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private (Admin only)
router.get('/:id', mongoIdValidation, handleValidationErrors, getUserById);

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin only)
router.put('/:id', mongoIdValidation, handleValidationErrors, updateUser);

// @desc    Delete user (soft delete)
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
router.delete('/:id', mongoIdValidation, handleValidationErrors, deleteUser);

module.exports = router;