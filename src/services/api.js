import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// For APK testing, we'll use localhost with adb port forwarding
// Make sure to run: adb reverse tcp:3000 tcp:3000
const API_BASE_URL = 'http://localhost:3000/api';

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

export default api;
