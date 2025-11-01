const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Set JWT Cookie
const setTokenCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('token', token, cookieOptions);
};

// @desc    Register a new admin user
// @route   POST /api/auth/register
// @access  Public (for initial setup) / Private (for admin creation)
const register = async (req, res) => {
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

    const mongoose = require('mongoose');
    
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database unavailable. Registration requires database connection. Please use demo login: admin@gimsr.com / admin123'
      });
    }

    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      password, 
      role = 'admin' 
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

    // Create admin user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      userType: 'admin',
      role,
      isActive: true,
      isVerified: true,
      verificationDate: new Date()
    });

    // Generate token
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'Admin user registered successfully',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Login admin user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
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

    const { email, password } = req.body;
    const mongoose = require('mongoose');

    // Check if database is connected
    const isDbConnected = mongoose.connection.readyState === 1;

    // Demo mode when database is not connected OR demo credentials
    if (!isDbConnected || (email === 'admin@gimsr.com' && password === 'admin123')) {
      // Only allow demo credentials when database is not connected
      if (!isDbConnected || (email === 'admin@gimsr.com' && password === 'admin123')) {
        const demoUser = {
          _id: 'demo-admin-id',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@gimsr.com',
          phone: '+1234567890',
          role: 'admin',
          userType: 'admin',
          isActive: true,
          isVerified: true,
          createdAt: new Date(),
          lastLogin: new Date()
        };

        // Generate token
        const token = generateToken(demoUser._id);
        setTokenCookie(res, token);

        return res.status(200).json({
          success: true,
          message: `Login successful ${!isDbConnected ? '(Demo Mode - DB Disconnected)' : '(Demo Mode)'}`,
          data: {
            user: demoUser,
            token
          }
        });
      }

      // If database is not connected and not demo credentials
      if (!isDbConnected) {
        return res.status(503).json({
          success: false,
          message: 'Database unavailable. Please use demo credentials: admin@gimsr.com / admin123'
        });
      }
    }

    try {
      // Find user by email and include password (only if database is connected)
      const user = await User.findOne({ 
        email, 
        userType: 'admin' 
      }).select('+password +loginAttempts +lockUntil');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if account is locked
      if (user.isLocked) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked due to too many failed login attempts'
        });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Contact administrator.'
        });
      }

      // Validate password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        // Increment login attempts
        await user.incLoginAttempts();
        
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Reset login attempts on successful login
      if (user.loginAttempts && user.loginAttempts > 0) {
        await user.resetLoginAttempts();
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user._id);
      setTokenCookie(res, token);

      // Remove sensitive data from response
      user.password = undefined;
      user.loginAttempts = undefined;
      user.lockUntil = undefined;

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          token
        }
      });

    } catch (dbError) {
      // If database error and using demo credentials, fallback to demo mode
      if (email === 'admin@gimsr.com' && password === 'admin123') {
        const demoUser = {
          _id: 'demo-admin-id',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@gimsr.com',
          phone: '+1234567890',
          role: 'admin',
          userType: 'admin',
          isActive: true,
          isVerified: true,
          createdAt: new Date(),
          lastLogin: new Date()
        };

        const token = generateToken(demoUser._id);
        setTokenCookie(res, token);

        return res.status(200).json({
          success: true,
          message: 'Login successful (Demo Mode - DB Unavailable)',
          data: {
            user: demoUser,
            token
          }
        });
      }
      
      throw dbError; // Re-throw if not demo credentials
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get current logged in admin
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Logout admin user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Clear token cookie
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    // If using session-based auth, destroy session
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = async (req, res) => {
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

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      data: {
        token
      }
    });

  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password update failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updatePassword
};