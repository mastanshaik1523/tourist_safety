const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's emergency contacts
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('emergencyContacts');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ emergencyContacts: user.emergencyContacts });
  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new emergency contact
router.post('/', auth, [
  body('name').notEmpty().withMessage('Contact name is required'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('relationship').optional().notEmpty().withMessage('Relationship cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phoneNumber, relationship = 'Emergency Contact' } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if contact already exists
    const existingContact = user.emergencyContacts.find(
      contact => contact.phoneNumber === phoneNumber
    );

    if (existingContact) {
      return res.status(400).json({ message: 'Contact with this phone number already exists' });
    }

    user.emergencyContacts.push({
      name,
      phoneNumber,
      relationship
    });

    await user.save();

    res.status(201).json({
      message: 'Emergency contact added successfully',
      contact: user.emergencyContacts[user.emergencyContacts.length - 1]
    });
  } catch (error) {
    console.error('Add emergency contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update emergency contact
router.put('/:contactId', auth, [
  body('name').optional().notEmpty().withMessage('Contact name cannot be empty'),
  body('phoneNumber').optional().notEmpty().withMessage('Phone number cannot be empty'),
  body('relationship').optional().notEmpty().withMessage('Relationship cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { contactId } = req.params;
    const { name, phoneNumber, relationship } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const contact = user.emergencyContacts.id(contactId);
    
    if (!contact) {
      return res.status(404).json({ message: 'Emergency contact not found' });
    }

    if (name) contact.name = name;
    if (phoneNumber) contact.phoneNumber = phoneNumber;
    if (relationship) contact.relationship = relationship;

    await user.save();

    res.json({
      message: 'Emergency contact updated successfully',
      contact
    });
  } catch (error) {
    console.error('Update emergency contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete emergency contact
router.delete('/:contactId', auth, async (req, res) => {
  try {
    const { contactId } = req.params;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const contact = user.emergencyContacts.id(contactId);
    
    if (!contact) {
      return res.status(404).json({ message: 'Emergency contact not found' });
    }

    contact.remove();
    await user.save();

    res.json({ message: 'Emergency contact deleted successfully' });
  } catch (error) {
    console.error('Delete emergency contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
