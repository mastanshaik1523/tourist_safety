# SOS Button and Emergency Contacts Testing Guide

## Features Implemented

### 1. SOS Button in Dashboard
- **Location**: Dashboard Screen → Quick Actions section
- **Functionality**: 
  - Red SOS button with call icon
  - Shows list of emergency contacts when clicked
  - Allows user to select which contact to call
  - Uses device's native phone app to make calls

### 2. Emergency Contacts Management
- **Location**: Settings → Emergency Contacts → Manage button
- **Features**:
  - Add new emergency contacts
  - Edit existing contacts
  - Delete contacts
  - Call contacts directly from the list
  - Form validation for required fields

### 3. Phone Call Integration
- **Technology**: React Native Linking API
- **Functionality**: 
  - Opens device's native phone app
  - Uses `tel:` URL scheme
  - Works on both iOS and Android
  - Requires physical device for actual calling (not emulator)

## Testing Instructions

### 1. Start the Application
```bash
# Terminal 1 - Start React Native app
cd "/Users/shaikmastan/Documents/Shaista/smart tourist/tourist_safety"
npm start

# Terminal 2 - Start backend server
cd "/Users/shaikmastan/Documents/Shaista/smart tourist/tourist_safety/backend"
npm start
```

### 2. Test SOS Button
1. Open the app and navigate to Dashboard
2. Look for the red "SOS" button in Quick Actions
3. Tap the SOS button
4. Verify that a list of emergency contacts appears
5. Select a contact to test the call functionality
6. On a physical device, this should open the phone app

### 3. Test Emergency Contacts Management
1. Go to Profile tab → Settings
2. Find "Emergency Contacts" section
3. Tap "Manage" button
4. Test adding a new contact:
   - Tap the "+" button in top right
   - Fill in name, phone number, and relationship
   - Tap "Add Contact"
5. Test editing a contact:
   - Tap the pencil icon next to any contact
   - Modify the information
   - Tap "Update Contact"
6. Test deleting a contact:
   - Tap the trash icon next to any contact
   - Confirm deletion
7. Test calling from the contacts list:
   - Tap the green call button next to any contact
   - This should open the phone app on a physical device

### 4. Mock Data
The app currently uses mock data for demonstration:
- Emergency Services: 911
- Family Contact: +1234567890
- Friend: +0987654321

## Important Notes

### Device Requirements
- **Physical Device**: Phone calls only work on physical devices with SIM cards
- **Emulator/Simulator**: Will show the call intent but cannot actually make calls
- **Permissions**: The app will request phone call permissions on first use

### Platform Differences
- **iOS**: Uses `tel:` URL scheme, opens native Phone app
- **Android**: Uses `tel:` URL scheme, may require CALL_PHONE permission

### Backend Integration
- Emergency contacts are currently stored locally (mock data)
- To integrate with backend, update the API calls in:
  - `DashboardScreen.js` → `loadEmergencyContacts()`
  - `EmergencyContactsScreen.js` → CRUD operations
  - Backend routes are already implemented in `backend/routes/emergencyContacts.js`

## File Structure
```
src/screens/
├── DashboardScreen.js          # Main dashboard with SOS button
├── EmergencyContactsScreen.js  # Emergency contacts management
└── SettingsScreen.js          # Settings with contacts overview

backend/routes/
└── emergencyContacts.js       # API routes for CRUD operations
```

## Next Steps for Production
1. Replace mock data with real API calls
2. Add proper error handling and loading states
3. Implement contact synchronization
4. Add contact import from device contacts
5. Add emergency contact categories (family, medical, etc.)
6. Implement emergency alert notifications
