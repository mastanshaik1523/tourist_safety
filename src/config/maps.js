// Google Maps Configuration
export const MAP_CONFIG = {
  // Replace with your actual Google Maps API key
  API_KEY: 'AIzaSyBVw-LLDbpvRIfK6HpeWFvtsV_HoPZc3CM',
  
  // Default map region (San Francisco)
  DEFAULT_REGION: {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  
  // Map styling
  MAP_STYLE: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
  
  // Safety zone colors
  ZONE_COLORS: {
    green: {
      stroke: '#34C759',
      fill: 'rgba(52, 199, 89, 0.1)',
    },
    yellow: {
      stroke: '#FF9500',
      fill: 'rgba(255, 149, 0, 0.1)',
    },
    red: {
      stroke: '#FF3B30',
      fill: 'rgba(255, 59, 48, 0.1)',
    },
  },
  
  // Incident marker colors
  INCIDENT_COLORS: {
    safety_alert: '#FF3B30',
    incident_report: '#FF9500',
    panic_button: '#FF3B30',
    medical_emergency: '#FF3B30',
    other: '#8E8E93',
  },
  
  // Emergency service marker colors
  EMERGENCY_COLORS: {
    police: '#007AFF',
    hospital: '#34C759',
    embassy: '#FF9500',
  },
};

export default MAP_CONFIG;
