import { INCIDENT_TYPES, SAFETY_ZONES } from './constants';

// Format timestamp to relative time
export const formatRelativeTime = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) {
    return 'Just now';
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Format date for display
export const formatDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
};

// Get incident type display name
export const getIncidentTypeName = (type) => {
  const typeNames = {
    [INCIDENT_TYPES.SAFETY_ALERT]: 'Safety Alert',
    [INCIDENT_TYPES.INCIDENT_REPORT]: 'Incident Report',
    [INCIDENT_TYPES.PANIC_BUTTON]: 'Panic Button',
    [INCIDENT_TYPES.MEDICAL_EMERGENCY]: 'Medical Emergency',
    [INCIDENT_TYPES.OTHER]: 'Other',
  };
  return typeNames[type] || 'Unknown';
};

// Get safety zone info
export const getSafetyZoneInfo = (zoneType) => {
  switch (zoneType) {
    case 'green':
      return SAFETY_ZONES.GREEN;
    case 'yellow':
      return SAFETY_ZONES.YELLOW;
    case 'red':
      return SAFETY_ZONES.RED;
    default:
      return SAFETY_ZONES.GREEN;
  }
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format
export const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Calculate distance between two coordinates
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

// Format distance for display
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else {
    return `${distance.toFixed(1)}km`;
  }
};

// Generate random ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Capitalize first letter
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Get user initials
export const getUserInitials = (name) => {
  if (!name) return 'U';
  const names = name.split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

// Check if location is within safety zone
export const isLocationInZone = (userLat, userLon, zoneBounds) => {
  const { north, south, east, west } = zoneBounds;
  return userLat >= south && userLat <= north && userLon >= west && userLon <= east;
};

// Format time for display
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// Get severity color
export const getSeverityColor = (severity) => {
  const colors = {
    low: '#34C759',
    medium: '#FF9500',
    high: '#FF3B30',
    critical: '#FF3B30',
  };
  return colors[severity] || '#8E8E93';
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    reported: '#FF9500',
    in_progress: '#007AFF',
    resolved: '#34C759',
    cancelled: '#8E8E93',
  };
  return colors[status] || '#8E8E93';
};
