import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { incidentsAPI, weatherAPI } from '../services/api';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    getLocationAndLoadAlerts();
  }, []);

  const getLocationAndLoadAlerts = async () => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for weather alerts');
        loadMockAlerts();
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
      await loadAlerts(location.coords);
    } catch (error) {
      console.error('Error getting location:', error);
      loadMockAlerts();
    }
  };

  const loadAlerts = async (coords = null) => {
    try {
      setIsLoading(true);
      const allAlerts = [];

      // Load weather alerts if location is available
      if (coords) {
        try {
          const weatherResponse = await weatherAPI.getWeatherAlerts(coords.latitude, coords.longitude);
          if (weatherResponse.data.success) {
            const weatherAlerts = weatherResponse.data.data.map((alert, index) => ({
              id: `weather_${index}`,
              type: 'weather_alert',
              title: alert.title,
              message: alert.message,
              severity: alert.severity,
              timestamp: new Date(alert.timestamp),
              isRead: false,
              icon: alert.icon,
            }));
            allAlerts.push(...weatherAlerts);
          }
        } catch (error) {
          console.error('Error loading weather alerts:', error);
        }
      }

      // Load incident alerts
      try {
        const incidentsResponse = await incidentsAPI.getMyIncidents();
        if (incidentsResponse.data.success) {
          const incidentAlerts = incidentsResponse.data.data.map(incident => ({
            id: `incident_${incident._id}`,
            type: 'incident_report',
            title: `Incident Report: ${incident.type}`,
            message: incident.description,
            severity: incident.severity || 'medium',
            timestamp: new Date(incident.createdAt),
            isRead: incident.status === 'resolved',
          }));
          allAlerts.push(...incidentAlerts);
        }
      } catch (error) {
        console.error('Error loading incident alerts:', error);
      }

      // Sort alerts by timestamp (newest first)
      allAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setAlerts(allAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
      loadMockAlerts();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockAlerts = () => {
    const mockAlerts = [
      {
        id: '1',
        type: 'weather_alert',
        title: 'Weather Warning',
        message: 'Heavy rain expected in your area. Stay indoors if possible.',
        severity: 'medium',
        timestamp: new Date(),
        isRead: false,
        icon: 'rainy',
      },
      {
        id: '2',
        type: 'incident_report',
        title: 'Traffic Incident',
        message: 'Road closure on Main Street due to construction.',
        severity: 'low',
        timestamp: new Date(Date.now() - 3600000),
        isRead: true,
      },
      {
        id: '3',
        type: 'safety_alert',
        title: 'Emergency Services Alert',
        message: 'Police activity reported in downtown area. Avoid the area if possible.',
        severity: 'high',
        timestamp: new Date(Date.now() - 7200000),
        isRead: false,
      },
    ];
    setAlerts(mockAlerts);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (location) {
      await loadAlerts(location);
    } else {
      await getLocationAndLoadAlerts();
    }
    setRefreshing(false);
  };

  const markAsRead = (alertId) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
  };

  const deleteAlert = (alertId) => {
    Alert.alert(
      'Delete Alert',
      'Are you sure you want to delete this alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAlerts(prev => prev.filter(alert => alert.id !== alertId));
          }
        }
      ]
    );
  };

  const getAlertIcon = (type, icon = null) => {
    if (icon) {
      // Use specific weather icon if provided
      switch (icon) {
        case 'thunderstorm':
          return 'thunderstorm';
        case 'wind':
          return 'leaf';
        case 'eye-off':
          return 'eye-off';
        case 'snow':
          return 'snow';
        case 'sunny':
          return 'sunny';
        case 'rainy':
          return 'rainy';
        default:
          return 'cloud';
      }
    }
    
    switch (type) {
      case 'safety_alert':
        return 'warning';
      case 'incident_report':
        return 'document-text';
      case 'weather_alert':
        return 'cloud';
      case 'traffic_alert':
        return 'car';
      default:
        return 'information-circle';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return '#FF3B30';
      case 'medium':
        return '#FF9500';
      case 'low':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="#F2F2F7" />
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Safety Alerts</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading alerts...</Text>
          </View>
        ) : alerts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={64} color="#8E8E93" />
            <Text style={styles.emptyTitle}>No Alerts</Text>
            <Text style={styles.emptyDescription}>
              You're all caught up! No new safety alerts at the moment.
            </Text>
          </View>
        ) : (
          alerts.map((alert) => (
            <TouchableOpacity
              key={alert.id}
              style={[
                styles.alertCard,
                !alert.isRead && styles.unreadAlert
              ]}
              onPress={() => markAsRead(alert.id)}
            >
              <View style={styles.alertHeader}>
                <View style={styles.alertIconContainer}>
                  <Ionicons
                    name={getAlertIcon(alert.type, alert.icon)}
                    size={24}
                    color={getSeverityColor(alert.severity)}
                  />
                </View>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertTimestamp}>
                    {formatTimestamp(alert.timestamp)}
                  </Text>
                </View>
                <View style={styles.alertActions}>
                  <TouchableOpacity
                    onPress={() => deleteAlert(alert.id)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#8E8E93" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.alertMessage}>{alert.message}</Text>
              {!alert.isRead && <View style={styles.unreadIndicator} />}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => Alert.alert('Settings', 'Alert settings would open here')}
        >
          <Ionicons name="settings" size={20} color="#007AFF" />
          <Text style={styles.quickActionText}>Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => Alert.alert('Report', 'Report new incident would open here')}
        >
          <Ionicons name="add-circle" size={20} color="#007AFF" />
          <Text style={styles.quickActionText}>Report</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  headerContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 60,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    flex: 1,
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
  },
  alertCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadAlert: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 5,
  },
  alertTimestamp: {
    fontSize: 12,
    color: '#8E8E93',
  },
  alertActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 5,
  },
  alertMessage: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  quickActions: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  quickActionText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});
