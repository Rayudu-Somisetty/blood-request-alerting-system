const UserService = require('../models/UserService');
const jwt = require('jsonwebtoken');
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

    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      password,
      userType = 'admin',
      role = 'admin'
    } = req.body;

    // Check if user already exists
    const existingUser = await UserService.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // For first admin, allow registration without authentication
    // For subsequent admins, require super_admin authentication
    const userCount = await UserService.getDashboardStats();
    if (userCount.totalUsers > 0 && (!req.user || req.user.role !== 'super_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Only super admin can create new admin accounts'
      });
    }

    // Create new user
    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      userType,
      role: userCount.totalUsers === 0 ? 'super_admin' : role, // First user is super_admin
      isActive: true,
      isVerified: true // Admin accounts are pre-verified
    };

    const user = await UserService.create(userData);

    // Generate token
    const token = generateToken(user.id);
    setTokenCookie(res, token);

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: `${userType} account created successfully`,
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle demo mode fallback
    if (error.message.includes('Prisma') || error.message.includes('database')) {
      return res.status(503).json({
        success: false,
        message: 'Database unavailable. Registration requires database connection. Please use demo login: admin@gimsr.com / admin123'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Authenticate user & get token
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

    try {
      // Find user by email
      const user = await UserService.findByEmail(email.toLowerCase().trim());
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if account is locked
      if (UserService.isLocked(user)) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
        });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact administrator.'
        });
      }

      // Validate password
      const isPasswordValid = await UserService.comparePassword(password, user.password);
      
      if (!isPasswordValid) {
        // Increment login attempts
        await UserService.incLoginAttempts(user.id);
        
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Reset login attempts on successful login
      await UserService.resetLoginAttempts(user.id);

      // Generate token
      const token = generateToken(user.id);
      setTokenCookie(res, token);

      // Remove sensitive data from response
      const userResponse = { ...user };
      delete userResponse.password;
      delete userResponse.loginAttempts;
      delete userResponse.lockUntil;

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          token
        }
      });

    } catch (dbError) {
      // Database connection failed - provide demo login
      console.log('Database unavailable, checking demo credentials');
      
      if (email === 'admin@gimsr.com' && password === 'admin123') {
        // Demo admin user
        const demoUser = {
          id: 'demo-admin-id',
          firstName: 'Demo',
          lastName: 'Admin',
          email: 'admin@gimsr.com',
          userType: 'admin',
          role: 'super_admin',
          isActive: true,
          isVerified: true
        };

        const token = generateToken(demoUser.id);
        setTokenCookie(res, token);

        return res.status(200).json({
          success: true,
          message: 'Demo login successful - Database in demo mode',
          data: {
            user: demoUser,
            token,
            demo: true
          }
        });
      }

      return res.status(503).json({
        success: false,
        message: 'Database unavailable. Please use demo login: admin@gimsr.com / admin123',
        demo: {
          email: 'admin@gimsr.com',
          password: 'admin123'
        }
      });
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

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
  try {
    // Clear the token cookie
    res.cookie('token', '', {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

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

// @desc    Get current authenticated user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // Handle demo mode
    if (req.user.id === 'demo-admin-id') {
      return res.status(200).json({
        success: true,
        data: {
          user: req.user,
          demo: true
        }
      });
    }

    const user = await UserService.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove sensitive data
    const userResponse = { ...user };
    delete userResponse.password;
    delete userResponse.loginAttempts;
    delete userResponse.lockUntil;

    res.status(200).json({
      success: true,
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Get me error:', error);
    
    // Handle database connection issues
    if (error.message.includes('Prisma') || error.message.includes('database')) {
      return res.status(503).json({
        success: false,
        message: 'Database unavailable',
        demo: true
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to get user information',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update user password
// @route   PUT /api/auth/password
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

    // Handle demo mode
    if (req.user.id === 'demo-admin-id') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update password in demo mode'
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await UserService.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isCurrentPasswordValid = await UserService.comparePassword(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    await UserService.update(user.id, { password: newPassword });

    // Generate new token
    const token = generateToken(user.id);
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
