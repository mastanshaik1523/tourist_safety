const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('nationality').notEmpty().withMessage('Nationality is required'),
  body('passportId').notEmpty().withMessage('Passport/ID number is required'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('emergencyContactName').notEmpty().withMessage('Emergency contact name is required'),
  body('emergencyContactNumber').notEmpty().withMessage('Emergency contact number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      fullName,
      email,
      password,
      nationality,
      passportId,
      phoneNumber,
      emergencyContactName,
      emergencyContactNumber
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { passportId }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or passport ID already exists'
      });
    }

    // Create new user
    const user = new User({
      fullName,
      email,
      password,
      nationality,
      passportId,
      phoneNumber,
      emergencyContacts: [{
        name: emergencyContactName,
        phoneNumber: emergencyContactNumber
      }]
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        nationality: user.nationality,
        identityVerification: user.identityVerification
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        nationality: user.nationality,
        identityVerification: user.identityVerification,
        locationTracking: user.locationTracking,
        privacySettings: user.privacySettings
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update identity verification documents
router.post('/verify-identity', auth, async (req, res) => {
  try {
    const { documents } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.identityVerification.documents = documents;
    user.identityVerification.status = 'pending';
    
    await user.save();

    res.json({
      message: 'Identity verification documents submitted successfully',
      status: user.identityVerification.status
    });
  } catch (error) {
    console.error('Identity verification error:', error);
    res.status(500).json({ message: 'Server error during identity verification' });
  }
});

module.exports = router;
