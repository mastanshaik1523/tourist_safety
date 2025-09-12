// App Constants
export const COLORS = {
  primary: '#007AFF',
  secondary: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  success: '#34C759',
  info: '#5AC8FA',
  light: '#F2F2F7',
  dark: '#1C1C1E',
  gray: '#8E8E93',
  white: '#FFFFFF',
  black: '#000000',
};

export const SAFETY_ZONES = {
  GREEN: {
    color: '#34C759',
    riskLevel: 'low',
    description: 'Low risk area. Enjoy your visit with standard precautions.',
  },
  YELLOW: {
    color: '#FF9500',
    riskLevel: 'medium',
    description: 'Moderate risk area. Exercise increased caution.',
  },
  RED: {
    color: '#FF3B30',
    riskLevel: 'high',
    description: 'High risk area. Avoid unless necessary.',
  },
};

export const INCIDENT_TYPES = {
  SAFETY_ALERT: 'safety_alert',
  INCIDENT_REPORT: 'incident_report',
  PANIC_BUTTON: 'panic_button',
  MEDICAL_EMERGENCY: 'medical_emergency',
  OTHER: 'other',
};

export const INCIDENT_STATUS = {
  REPORTED: 'reported',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled',
};

export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    VERIFY_IDENTITY: '/auth/verify-identity',
  },
  USERS: {
    PROFILE: '/users/profile',
    LOCATION: '/users/location',
    PRIVACY_SETTINGS: '/users/privacy-settings',
    TOGGLE_LOCATION: '/users/toggle-location-tracking',
  },
  INCIDENTS: {
    REPORT: '/incidents/report',
    MY_INCIDENTS: '/incidents/my-incidents',
    HISTORY: '/incidents/history',
    GET_INCIDENT: '/incidents',
  },
  SAFETY_ZONES: {
    GET_ZONES: '/safety-zones',
    GET_ZONE: '/safety-zones',
  },
  EMERGENCY_CONTACTS: {
    GET_CONTACTS: '/emergency-contacts',
    ADD_CONTACT: '/emergency-contacts',
    UPDATE_CONTACT: '/emergency-contacts',
    DELETE_CONTACT: '/emergency-contacts',
  },
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'user',
  LOCATION_PERMISSION: 'locationPermission',
  NOTIFICATION_SETTINGS: 'notificationSettings',
};

export const PERMISSIONS = {
  LOCATION: 'location',
  CAMERA: 'camera',
  NOTIFICATIONS: 'notifications',
};

export const MAP_CONFIG = {
  DEFAULT_REGION: {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  ZONE_RADIUS: 1000, // meters
};

export const NOTIFICATION_TYPES = {
  SAFETY_ALERT: 'safety_alert',
  INCIDENT_UPDATE: 'incident_update',
  LOCATION_ALERT: 'location_alert',
  EMERGENCY_CONTACT: 'emergency_contact',
};

export const APP_CONFIG = {
  NAME: 'Smart Tourist',
  VERSION: '1.0.0',
  DESCRIPTION: 'Your safety companion for travel',
};
