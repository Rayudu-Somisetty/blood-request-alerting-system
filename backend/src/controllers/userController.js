const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all users with pagination and filtering
// @route   GET /api/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      userType,
      bloodGroup,
      isActive,
      isVerified,
      sort = 'createdAt:desc'
    } = req.query;

    // Build filter object
    const filter = {};

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (userType) filter.userType = userType;
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

    // Build sort object
    const [sortField, sortOrder] = sort.split(':');
    const sortObj = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get users with pagination
    const users = await User.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password -loginAttempts -lockUntil');

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private (Admin only)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -loginAttempts -lockUntil');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Create new user (donor/patient)
// @route   POST /api/users
// @access  Private (Admin only)
const createUser = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      userType,
      bloodGroup,
      dateOfBirth,
      gender,
      weight,
      address,
      medicalHistory,
      emergencyContact
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      userType,
      bloodGroup,
      dateOfBirth,
      gender,
      weight,
      address,
      medicalHistory,
      emergencyContact,
      isActive: true,
      isVerified: false
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user
      }
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
    const userId = req.params.id;
    const updateData = req.body;

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).select('-password -loginAttempts -lockUntil');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user
      }
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
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password -loginAttempts -lockUntil');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: {
        user
      }
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

// @desc    Get dashboard statistics
// @route   GET /api/users/stats
// @access  Private (Admin only)
const getUserStats = async (req, res) => {
  try {
    const stats = await User.getDashboardStats();

    res.status(200).json({
      success: true,
      message: 'User statistics retrieved successfully',
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
      emergencyContact,
      medicalHistory,
      consentGiven
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
        userExists: true
      });
    }

    // Create new donor registration
    const newDonor = new User({
      firstName,
      lastName,
      email,
      phone,
      bloodGroup,
      dateOfBirth,
      address,
      emergencyContact,
      medicalHistory,
      userType: 'donor',
      registrationSource: 'public_form',
      status: 'pending_verification',
      consentGiven,
      isActive: true,
      isVerified: false,
      createdAt: new Date()
    });

    await newDonor.save();

    // Send welcome email (optional)
    // await emailService.sendWelcomeEmail(newDonor);

    res.status(201).json({
      success: true,
      message: 'Donor registration submitted successfully',
      donorId: newDonor._id,
      data: {
        name: `${newDonor.firstName} ${newDonor.lastName}`,
        email: newDonor.email,
        bloodGroup: newDonor.bloodGroup,
        status: newDonor.status
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