const UserService = require('../models/UserService');
const { validationResult } = require('express-validator');
const { sendEmail } = require('../utils/emailService');

// @desc    Get all users with pagination and filtering
// @route   GET /api/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, userType, status } = req.query;
    const skip = (page - 1) * limit;

    // Build Firestore where clause
    const where = {};
    if (userType) where.userType = userType;
    if (status) where.isActive = status === 'active';

    const options = {
      limit: parseInt(limit),
      offset: parseInt(skip),
      where
    };

    const result = await UserService.getAll(options);
    
    // Apply search filter in memory if needed (Firestore doesn't support full-text OR queries easily)
    let filteredUsers = result.users;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phone?.includes(search)
      );
    }

    res.status(200).json({
      success: true,
      data: filteredUsers,
      pagination: {
        total: result.total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(result.total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin only)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserService.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Create a new user
// @route   POST /api/users
// @access  Private (Admin only)
const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { firstName, lastName, email, phone, password, bloodGroup, userType, role } = req.body;

    // Check if user already exists
    const existingUser = await UserService.findByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const user = await UserService.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      bloodGroup,
      userType,
      role,
      isActive: true,
      isVerified: false
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Don't allow password updates through this endpoint
    delete updateData.password;

    const user = await UserService.update(id, updateData);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Delete user (soft delete)
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserService.delete(id);

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: user
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (Admin only)
const getUserStats = async (req, res) => {
  try {
    const stats = await UserService.getStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// PUBLIC ENDPOINT FOR MAIN WEBSITE INTEGRATION

// Create donor registration from public form
const createPublicDonorRegistration = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      bloodGroup,
      dateOfBirth,
      address,
      city,
      state,
      consentGiven
    } = req.body;

    // Check if user already exists
    const existingUser = await UserService.findByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
        userExists: true
      });
    }

    // Create new donor registration
    const newDonor = await UserService.create({
      firstName,
      lastName,
      email,
      phone,
      password: `temp-${Date.now()}`, // Temporary password for public donors
      bloodGroup,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      address,
      city,
      state,
      userType: 'donor',
      role: 'user',
      isActive: true,
      isVerified: false
    });

    // Send welcome email
    try {
      const welcomeMessage = `Welcome to Blood Alert System, ${newDonor.firstName}!\n\nThank you for registering as a blood donor. Your profile has been created with the following details:\n\nName: ${newDonor.firstName} ${newDonor.lastName}\nBlood Group: ${newDonor.bloodGroup}\nEmail: ${newDonor.email}\n\nYou will receive notifications when your blood type is needed. Your donation could save lives!\n\nBest regards,\nBlood Alert Team`;
      await sendEmail(
        newDonor.email,
        'Welcome to Blood Alert System',
        welcomeMessage
      );
      console.log(`📧 Welcome email sent to ${newDonor.email}`);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Donor registration submitted successfully',
      donorId: newDonor.id,
      data: {
        name: `${newDonor.firstName} ${newDonor.lastName}`,
        email: newDonor.email,
        bloodGroup: newDonor.bloodGroup
      }
    });
  } catch (error) {
    console.error('Public donor registration error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to submit donor registration',
      error: error.message
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  createPublicDonorRegistration
};
