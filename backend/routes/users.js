const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Update user profile
router.put('/profile', auth, [
  body('fullName').optional().notEmpty().withMessage('Full name cannot be empty'),
  body('phoneNumber').optional().notEmpty().withMessage('Phone number cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, phoneNumber } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update location
router.put('/location', auth, [
  body('latitude').isNumeric().withMessage('Valid latitude is required'),
  body('longitude').isNumeric().withMessage('Valid longitude is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { latitude, longitude } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.locationTracking.lastKnownLocation = {
      latitude,
      longitude,
      timestamp: new Date()
    };

    await user.save();

    res.json({
      message: 'Location updated successfully',
      location: user.locationTracking.lastKnownLocation
    });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update privacy settings
router.put('/privacy-settings', auth, async (req, res) => {
  try {
    const { locationTracking, safetyAlerts } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (typeof locationTracking === 'boolean') {
      user.privacySettings.locationTracking = locationTracking;
    }
    if (typeof safetyAlerts === 'boolean') {
      user.privacySettings.safetyAlerts = safetyAlerts;
    }

    await user.save();

    res.json({
      message: 'Privacy settings updated successfully',
      privacySettings: user.privacySettings
    });
  } catch (error) {
    console.error('Privacy settings update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle location tracking
router.put('/toggle-location-tracking', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.locationTracking.enabled = !user.locationTracking.enabled;
    await user.save();

    res.json({
      message: 'Location tracking toggled successfully',
      enabled: user.locationTracking.enabled
    });
  } catch (error) {
    console.error('Location tracking toggle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
