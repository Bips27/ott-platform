const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const { sendSms } = require('../services/smsService');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { email, password, firstName, lastName } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Create new user
  const user = new User({
    email,
    password,
    firstName,
    lastName
  });

  await user.save();

  // Generate token
  const token = generateToken(user._id);

  // Update last login
  await user.updateLastLogin();

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      token,
      user: user.getPublicProfile()
    }
  });
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  // Find user
  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated'
    });
  }

  // Check if user is blocked
  if (user.isBlocked) {
    return res.status(403).json({
      success: false,
      message: 'Account is blocked. Please contact support.'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Generate token
  const token = generateToken(user._id);

  // Update last login
  await user.updateLastLogin();

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: user.getPublicProfile()
    }
  });
}));

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { email } = req.body;

  // Find user
  const user = await User.findByEmail(email);
  if (!user) {
    // Don't reveal if email exists or not for security
    return res.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.'
    });
  }

  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save();

  // In a real app, you would send an email here
  // For now, we'll just return the token (remove this in production)
  console.log(`Password reset token for ${email}: ${resetToken}`);

  res.json({
    success: true,
    message: 'If an account with that email exists, we have sent a password reset link.',
    // Remove this in production - only for development
    resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
  });
}));

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { token, password } = req.body;

  // Find user by reset token
  const user = await User.findByResetToken(token);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }

  // Update password
  user.password = password;
  user.clearPasswordResetToken();
  await user.save();

  res.json({
    success: true,
    message: 'Password has been reset successfully'
  });
}));

// @route   POST /api/auth/send-otp
// @desc    Send OTP to mobile number
// @access  Public
router.post('/send-otp', [
  body('mobileNumber')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid mobile number'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be less than 50 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { mobileNumber, firstName, lastName } = req.body;

  // Check if user exists
  let user = await User.findByMobileNumber(mobileNumber);
  
  if (!user) {
    // Create new user if doesn't exist
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required for new users'
      });
    }
    
    user = new User({
      mobileNumber,
      firstName,
      lastName,
      isMobileVerified: false
    });
  }

  // Generate OTP
  const otp = user.generateOTP();
  await user.save();

  // Send SMS (with dev fallback inside service)
  try {
    await sendSms(mobileNumber, `Your verification code is ${otp}. It expires in 5 minutes.`);
  } catch (e) {
    return res.status(e.statusCode || 500).json({ success: false, message: e.message || 'Failed to send SMS' });
  }

  res.json({
    success: true,
    message: 'OTP sent successfully'
  });
}));

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and login/register user
// @access  Public
router.post('/verify-otp', [
  body('mobileNumber')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid mobile number'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { mobileNumber, otp } = req.body;

  // Find user
  const user = await User.findByMobileNumber(mobileNumber);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number not found. Please request OTP first.'
    });
  }

  // Verify OTP
  if (!user.verifyOTP(otp)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired OTP'
    });
  }

  // Mark mobile as verified
  user.isMobileVerified = true;
  user.clearOTP();
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  // Update last login
  await user.updateLastLogin();

  res.json({
    success: true,
    message: 'OTP verified successfully',
    data: {
      token,
      user: user.getPublicProfile(),
      isNewUser: user.createdAt.getTime() === user.updatedAt.getTime()
    }
  });
}));

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authMiddleware, asyncHandler(async (req, res) => {
  // In a real app, you might want to blacklist the token
  // For now, we'll just return success (client removes token)
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: {
      user: user.getPublicProfile()
    }
  });
}));

module.exports = router;
