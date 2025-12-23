# Smart Tourist App

A comprehensive React Native application for tourist safety with real-time location tracking, incident reporting, and emergency contact management.

## Features

### 🚀 Core Features
- **User Registration & Authentication** - Secure account creation with identity verification
- **Real-time Location Tracking** - GPS-based location monitoring with privacy controls
- **Safety Zone Management** - Color-coded zones (Green/Yellow/Red) with risk assessments
- **Incident Reporting** - Quick reporting of safety incidents and emergencies
- **Emergency Contacts** - Manage and notify emergency contacts
- **Safety Alerts** - Real-time notifications for safety updates
- **History Tracking** - Complete timeline of safety events and incidents

### 📱 Screens
1. **Welcome & Onboarding** - App introduction and safety overview
2. **Create Account** - User registration with emergency contact setup
3. **Identity Verification** - Document verification with progress tracking
4. **Safety Dashboard** - Main hub with current safety zone and quick actions
5. **Interactive Map** - Google Maps integration with safety zones and incidents
6. **Alerts** - Safety notifications and incident updates
7. **History** - Chronological timeline of safety events
8. **Profile** - User profile and privacy settings
9. **Settings** - Emergency contacts and notification preferences

## Tech Stack

### Frontend
- **React Native** with Expo
- **React Navigation** for screen navigation
- **Google Maps** for location services
- **AsyncStorage** for local data persistence
- **Axios** for API communication

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- MongoDB Atlas account (or local MongoDB)
- Google Maps API key

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd smart-tourist
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
npm install
```

#### Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 3. Environment Configuration

#### Backend Environment
Create `backend/config.env` file:
```env
MONGODB_URI=mongodb+srv://rafisufiha05053_db_user:pggtV2CP299LwAId@cluster0.d6yxjpd.mongodb.net/smart-tourist
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3000
NODE_ENV=development
```

#### Frontend Configuration
Update `src/services/api.js` with your backend URL:
```javascript
const API_BASE_URL = 'http://your-backend-url:3000/api';
```

### 4. Google Maps Setup

1. Get your Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the following APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API
   - Geocoding API

3. Update `app.json` with your API key:
```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

### 5. Database Setup

#### Seed Initial Data
```bash
cd backend
node seed.js
```

This will create:
- Sample safety zones (Green, Yellow, Red)
- Test user account (email: john.doe@example.com, password: password123)

### 6. Running the Application

#### Start Backend Server
```bash
cd backend
npm start
```

#### Start Frontend (in a new terminal)
```bash
npm start
```

#### Run Both Together
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-identity` - Submit identity documents

### Users
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/location` - Update user location
- `PUT /api/users/privacy-settings` - Update privacy settings
- `PUT /api/users/toggle-location-tracking` - Toggle location tracking

### Incidents
- `POST /api/incidents/report` - Report new incident
- `GET /api/incidents/my-incidents` - Get user's incidents
- `GET /api/incidents/history` - Get incident history
- `GET /api/incidents/:id` - Get specific incident
- `PUT /api/incidents/:id/status` - Update incident status

### Safety Zones
- `GET /api/safety-zones` - Get all safety zones
- `GET /api/safety-zones/:id` - Get specific safety zone

### Emergency Contacts
- `GET /api/emergency-contacts` - Get user's emergency contacts
- `POST /api/emergency-contacts` - Add new emergency contact
- `PUT /api/emergency-contacts/:id` - Update emergency contact
- `DELETE /api/emergency-contacts/:id` - Delete emergency contact

## Project Structure

```
smart-tourist/
├── src/
│   ├── screens/           # All app screens
│   ├── context/           # React context providers
│   └── services/          # API services
├── backend/
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── server.js          # Main server file
│   └── seed.js            # Database seeding script
├── App.js                 # Main app component
├── package.json           # Frontend dependencies
└── README.md             # This file
```

## Usage Guide

### 1. First Time Setup
1. Open the app and go through the welcome screen
2. Create an account with your personal information
3. Add at least one emergency contact
4. Complete identity verification (upload documents)
5. Wait for verification approval

### 2. Using the Dashboard
- View your current safety zone status
- Toggle location tracking on/off
- Use quick actions to report incidents or trigger panic button
- Monitor real-time safety updates

### 3. Map Features
- View safety zones with color coding
- See reported incidents in your area
- Tap on map to report incidents at specific locations
- Use legend to understand zone meanings

### 4. Managing Alerts
- View all safety notifications
- Mark alerts as read
- Delete old alerts
- Access quick reporting features

### 5. Settings & Privacy
- Manage emergency contacts
- Adjust privacy settings
- Control notification preferences
- Update profile information

## Safety Zone System

### Green Zone (Low Risk)
- Safe for normal tourist activities
- Standard precautions recommended
- Well-lit and populated areas

### Yellow Zone (Medium Risk)
- Exercise increased caution
- Avoid walking alone at night
- Keep valuables secure

### Red Zone (High Risk)
- Avoid unless necessary
- Travel in groups if you must go
- Inform someone of your plans

## Development

### Adding New Features
1. Create new screen components in `src/screens/`
2. Add API endpoints in `backend/routes/`
3. Update navigation in `App.js`
4. Add new models in `backend/models/` if needed

### Testing
- Use the seeded test account for development
- Test on both iOS and Android devices
- Verify location permissions work correctly
- Test offline functionality

## Deployment

### Backend Deployment
1. Deploy to services like Heroku, Railway, or DigitalOcean
2. Update environment variables
3. Ensure MongoDB connection is secure
4. Set up proper CORS configuration

### Frontend Deployment
1. Build for production using Expo
2. Deploy to app stores (iOS App Store, Google Play)
3. Update API endpoints for production
4. Configure push notifications

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens for secure authentication
- Input validation on all API endpoints
- Rate limiting to prevent abuse
- CORS configuration for API security

## Support

For issues or questions:
1. Check the console logs for errors
2. Verify all environment variables are set
3. Ensure MongoDB connection is working
4. Check Google Maps API key configuration

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Note**: This is a demo application. For production use, implement additional security measures, error handling, and testing.
"# tour-shield" 
