const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

const User = require('./models/User');
const SafetyZone = require('./models/SafetyZone');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await SafetyZone.deleteMany({});

    // Create sample safety zones
    const safetyZones = [
      {
        name: 'Green Zone - Downtown',
        description: 'Low risk area. Enjoy your visit with standard precautions.',
        zoneType: 'green',
        riskLevel: 'low',
        location: {
          type: 'Polygon',
          coordinates: [[
            [-122.4194, 37.7749],
            [-122.4094, 37.7749],
            [-122.4094, 37.7849],
            [-122.4194, 37.7849],
            [-122.4194, 37.7749]
          ]],
          center: {
            latitude: 37.7749,
            longitude: -122.4194
          }
        },
        boundaries: {
          north: 37.7849,
          south: 37.7749,
          east: -122.4094,
          west: -122.4194
        },
        safetyGuidelines: [
          {
            title: 'General Safety',
            description: 'Stay aware of your surroundings and keep valuables secure.'
          },
          {
            title: 'Emergency Contacts',
            description: 'Save local emergency numbers in your phone.'
          }
        ],
        emergencyServices: {
          police: '+1-555-POLICE',
          hospital: '+1-555-HOSPITAL',
          embassy: '+1-555-EMBASSY'
        }
      },
      {
        name: 'Yellow Zone - Market District',
        description: 'Moderate risk area. Exercise increased caution.',
        zoneType: 'yellow',
        riskLevel: 'medium',
        location: {
          type: 'Polygon',
          coordinates: [[
            [-122.4294, 37.7649],
            [-122.4194, 37.7649],
            [-122.4194, 37.7749],
            [-122.4294, 37.7749],
            [-122.4294, 37.7649]
          ]],
          center: {
            latitude: 37.7649,
            longitude: -122.4294
          }
        },
        boundaries: {
          north: 37.7749,
          south: 37.7649,
          east: -122.4194,
          west: -122.4294
        },
        safetyGuidelines: [
          {
            title: 'Increased Caution',
            description: 'Avoid walking alone at night and stay in well-lit areas.'
          },
          {
            title: 'Valuables',
            description: 'Keep expensive items out of sight and use hotel safes.'
          }
        ],
        emergencyServices: {
          police: '+1-555-POLICE',
          hospital: '+1-555-HOSPITAL',
          embassy: '+1-555-EMBASSY'
        }
      },
      {
        name: 'Red Zone - Industrial Area',
        description: 'High risk area. Avoid unless necessary.',
        zoneType: 'red',
        riskLevel: 'high',
        location: {
          type: 'Polygon',
          coordinates: [[
            [-122.4394, 37.7549],
            [-122.4294, 37.7549],
            [-122.4294, 37.7649],
            [-122.4394, 37.7649],
            [-122.4394, 37.7549]
          ]],
          center: {
            latitude: 37.7549,
            longitude: -122.4394
          }
        },
        boundaries: {
          north: 37.7649,
          south: 37.7549,
          east: -122.4294,
          west: -122.4394
        },
        safetyGuidelines: [
          {
            title: 'High Risk Area',
            description: 'Avoid this area unless absolutely necessary.'
          },
          {
            title: 'If You Must Go',
            description: 'Travel in groups and inform someone of your plans.'
          }
        ],
        emergencyServices: {
          police: '+1-555-POLICE',
          hospital: '+1-555-HOSPITAL',
          embassy: '+1-555-EMBASSY'
        }
      }
    ];

    await SafetyZone.insertMany(safetyZones);
    console.log('Safety zones created successfully');

    // Create a sample user
    const sampleUser = new User({
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123', // Let the model hash it
      nationality: 'American',
      passportId: 'A12345678',
      phoneNumber: '+1-555-0123',
      emergencyContacts: [
        {
          name: 'Jane Doe',
          phoneNumber: '+1-555-0124',
          relationship: 'Spouse'
        }
      ],
      identityVerification: {
        status: 'verified',
        verifiedAt: new Date()
      },
      locationTracking: {
        enabled: true,
        lastKnownLocation: {
          latitude: 37.7749,
          longitude: -122.4194,
          timestamp: new Date()
        }
      },
      privacySettings: {
        locationTracking: true,
        safetyAlerts: true
      }
    });

    await sampleUser.save();
    console.log('Sample user created successfully');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
