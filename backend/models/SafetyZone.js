const mongoose = require('mongoose');

const safetyZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  zoneType: {
    type: String,
    enum: ['green', 'yellow', 'red'],
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Polygon', 'Point'],
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]], // For polygon coordinates
      required: true
    },
    center: {
      latitude: Number,
      longitude: Number
    }
  },
  boundaries: {
    north: Number,
    south: Number,
    east: Number,
    west: Number
  },
  safetyGuidelines: [{
    title: String,
    description: String
  }],
  emergencyServices: {
    police: String,
    hospital: String,
    embassy: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SafetyZone', safetyZoneSchema);
