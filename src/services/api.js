import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configure API base URL based on environment
const getApiBaseUrl = () => {
  if (__DEV__) {
    // Development mode - use local development server
    return Platform.OS === 'android' 
      ? 'http://10.0.10.143:3000/api'  // Network IP for physical device
      : 'http://localhost:3000/api';     // localhost for iOS simulator
  }
  // Production mode - use Railway deployment URL
  return 'https://touristsafety-production.up.railway.app/api';
};

const API_BASE_URL = getApiBaseUrl();

// Log the API base URL for debugging
console.log('API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      // You might want to redirect to login here
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  verifyIdentity: (documents) => api.post('/auth/verify-identity', { documents }),
};

// Users API
export const usersAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  updateLocation: (latitude, longitude) => api.put('/users/location', { latitude, longitude }),
  updatePrivacySettings: (settings) => api.put('/users/privacy-settings', settings),
  toggleLocationTracking: () => api.put('/users/toggle-location-tracking'),
};

// Incidents API
export const incidentsAPI = {
  reportIncident: (incidentData) => api.post('/incidents/report', incidentData),
  getMyIncidents: (params) => api.get('/incidents/my-incidents', { params }),
  getIncidentHistory: (params) => api.get('/incidents/history', { params }),
  getIncident: (id) => api.get(`/incidents/${id}`),
  updateIncidentStatus: (id, status, notes) => api.put(`/incidents/${id}/status`, { status, resolutionNotes: notes }),
};

// Safety Zones API
export const safetyZonesAPI = {
  getSafetyZones: (params) => api.get('/safety-zones', { params }),
  getSafetyZone: (id) => api.get(`/safety-zones/${id}`),
};

// Emergency Contacts API
export const emergencyContactsAPI = {
  getContacts: () => api.get('/emergency-contacts'),
  addContact: (contactData) => api.post('/emergency-contacts', contactData),
  updateContact: (id, contactData) => api.put(`/emergency-contacts/${id}`, contactData),
  deleteContact: (id) => api.delete(`/emergency-contacts/${id}`),
};

// Weather API
export const weatherAPI = {
  getCurrentWeather: (lat, lon) => api.get('/weather/current', { params: { lat, lon } }),
  getWeatherAlerts: (lat, lon) => api.get('/weather/alerts', { params: { lat, lon } }),
  getWeatherForecast: (lat, lon) => api.get('/weather/forecast', { params: { lat, lon } }),
  getSafetyReport: (lat, lon) => api.get('/weather/safety-report', { params: { lat, lon } }),
};

export default api;
