const express = require('express');
const { body, validationResult } = require('express-validator');
const Incident = require('../models/Incident');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Report new incident
router.post('/report', auth, [
  body('type').isIn(['safety_alert', 'incident_report', 'panic_button', 'medical_emergency', 'other']).withMessage('Valid incident type is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('latitude').isNumeric().withMessage('Valid latitude is required'),
  body('longitude').isNumeric().withMessage('Valid longitude is required'),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Valid severity level is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      type,
      title,
      description,
      latitude,
      longitude,
      address,
      city,
      country,
      severity = 'medium',
      images = []
    } = req.body;

    const incident = new Incident({
      userId: req.userId,
      type,
      title,
      description,
      location: {
        latitude,
        longitude,
        address,
        city,
        country
      },
      severity,
      images
    });

    await incident.save();

    // Get user's emergency contacts for notification
    const user = await User.findById(req.userId);
    if (user && user.emergencyContacts.length > 0) {
      incident.emergencyContactsNotified = user.emergencyContacts.map(contact => ({
        contactId: contact._id,
        notifiedAt: new Date(),
        status: 'pending'
      }));
      await incident.save();
    }

    res.status(201).json({
      message: 'Incident reported successfully',
      incident: {
        id: incident._id,
        type: incident.type,
        title: incident.title,
        status: incident.status,
        severity: incident.severity,
        createdAt: incident.createdAt
      }
    });
  } catch (error) {
    console.error('Incident report error:', error);
    res.status(500).json({ message: 'Server error during incident reporting' });
  }
});

// Get user's incidents
router.get('/my-incidents', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const query = { userId: req.userId };

    if (status) query.status = status;
    if (type) query.type = type;

    const incidents = await Incident.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-emergencyContactsNotified');

    const total = await Incident.countDocuments(query);

    res.json({
      incidents,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get incident history (for history screen)
router.get('/history', auth, async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const incidents = await Incident.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('type title status severity createdAt');

    // Group incidents by date
    const groupedIncidents = incidents.reduce((acc, incident) => {
      const date = incident.createdAt.toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(incident);
      return acc;
    }, {});

    res.json({ incidents: groupedIncidents });
  } catch (error) {
    console.error('Get incident history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single incident
router.get('/:id', auth, async (req, res) => {
  try {
    const incident = await Incident.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    res.json({ incident });
  } catch (error) {
    console.error('Get incident error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update incident status
router.put('/:id/status', auth, [
  body('status').isIn(['reported', 'in_progress', 'resolved', 'cancelled']).withMessage('Valid status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, resolutionNotes } = req.body;

    const incident = await Incident.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    incident.status = status;
    if (status === 'resolved') {
      incident.resolvedAt = new Date();
      incident.resolvedBy = req.userId;
      if (resolutionNotes) incident.resolutionNotes = resolutionNotes;
    }

    await incident.save();

    res.json({
      message: 'Incident status updated successfully',
      incident: {
        id: incident._id,
        status: incident.status,
        resolvedAt: incident.resolvedAt
      }
    });
  } catch (error) {
    console.error('Update incident status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
