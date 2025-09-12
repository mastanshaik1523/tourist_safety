const express = require('express');
const SafetyZone = require('../models/SafetyZone');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all safety zones
router.get('/', async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    
    let query = { isActive: true };
    
    // If coordinates provided, find zones containing the point
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      // For now, return all zones. In production, implement proper geospatial query
      const zones = await SafetyZone.find(query);
      
      // Simple point-in-polygon check (simplified for demo)
      const userZone = zones.find(zone => {
        if (zone.location.type === 'Point') {
          const distance = Math.sqrt(
            Math.pow(zone.location.center.latitude - lat, 2) +
            Math.pow(zone.location.center.longitude - lng, 2)
          );
          return distance < 0.01; // ~1km radius
        }
        return true; // For demo, assume user is in first zone
      });
      
      return res.json({
        currentZone: userZone || zones[0],
        allZones: zones
      });
    }
    
    const zones = await SafetyZone.find(query);
    res.json({ zones });
  } catch (error) {
    console.error('Get safety zones error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get safety zone by ID
router.get('/:id', async (req, res) => {
  try {
    const zone = await SafetyZone.findById(req.params.id);
    
    if (!zone) {
      return res.status(404).json({ message: 'Safety zone not found' });
    }
    
    res.json({ zone });
  } catch (error) {
    console.error('Get safety zone error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create safety zone (admin only - for demo purposes)
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      zoneType,
      riskLevel,
      coordinates,
      center,
      safetyGuidelines,
      emergencyServices
    } = req.body;

    const zone = new SafetyZone({
      name,
      description,
      zoneType,
      riskLevel,
      location: {
        type: 'Polygon',
        coordinates,
        center
      },
      safetyGuidelines,
      emergencyServices
    });

    await zone.save();

    res.status(201).json({
      message: 'Safety zone created successfully',
      zone
    });
  } catch (error) {
    console.error('Create safety zone error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
