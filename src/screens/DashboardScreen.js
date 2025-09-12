import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { safetyZonesAPI, incidentsAPI } from '../services/api';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [currentZone, setCurrentZone] = useState(null);
  const [locationTracking, setLocationTracking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSafetyZone();
    if (user?.locationTracking) {
      setLocationTracking(user.locationTracking.enabled);
    }
  }, [user]);

  const loadSafetyZone = async () => {
    try {
      // For demo purposes, we'll use mock data
      setCurrentZone({
        name: 'Green Zone',
        description: 'Low risk area. Enjoy your visit with standard precautions.',
        zoneType: 'green',
        riskLevel: 'low'
      });
    } catch (error) {
      console.error('Error loading safety zone:', error);
    }
  };

  const toggleLocationTracking = async () => {
    try {
      setLocationTracking(!locationTracking);
      // Here you would call the API to update the setting
    } catch (error) {
      Alert.alert('Error', 'Failed to update location tracking setting.');
      setLocationTracking(locationTracking); // Revert on error
    }
  };

  const handleReportIncident = () => {
    Alert.alert(
      'Report Incident',
      'What type of incident would you like to report?',
      [
        { text: 'Safety Alert', onPress: () => reportIncident('safety_alert') },
        { text: 'Medical Emergency', onPress: () => reportIncident('medical_emergency') },
        { text: 'Other', onPress: () => reportIncident('other') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const reportIncident = async (type) => {
    try {
      setIsLoading(true);
      // Here you would call the incidents API
      Alert.alert('Success', 'Incident reported successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to report incident. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePanicButton = () => {
    Alert.alert(
      'Emergency Alert',
      'Are you sure you want to trigger the panic button? This will notify emergency contacts and authorities.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          style: 'destructive',
          onPress: () => {
            // Trigger panic button
            Alert.alert('Alert Sent', 'Emergency alert has been sent to your contacts and local authorities.');
          }
        }
      ]
    );
  };

  const getZoneColor = (zoneType) => {
    switch (zoneType) {
      case 'green': return '#34C759';
      case 'yellow': return '#FF9500';
      case 'red': return '#FF3B30';
      default: return '#34C759';
    }
  };

  const getZoneIcon = (zoneType) => {
    switch (zoneType) {
      case 'green': return 'checkmark-circle';
      case 'yellow': return 'warning';
      case 'red': return 'alert-circle';
      default: return 'checkmark-circle';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="#F2F2F7" />
      <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="menu" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety Dashboard</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Safety Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Safety Zone</Text>
          <View style={styles.zoneCard}>
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' }}
              style={styles.zoneImage}
              imageStyle={styles.zoneImageStyle}
            >
              <View style={styles.zoneOverlay}>
                <View style={styles.zoneInfo}>
                  <View style={styles.zoneIconContainer}>
                    <Ionicons 
                      name={getZoneIcon(currentZone?.zoneType)} 
                      size={24} 
                      color="white" 
                    />
                  </View>
                  <View style={styles.zoneTextContainer}>
                    <Text style={styles.zoneName}>{currentZone?.name}</Text>
                    <Text style={styles.zoneDescription}>{currentZone?.description}</Text>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </View>
        </View>

        {/* Location Tracking */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Tracking</Text>
          <View style={styles.trackingCard}>
            <View style={styles.trackingInfo}>
              <View style={styles.trackingIcon}>
                <Ionicons name="location" size={24} color="#007AFF" />
              </View>
              <View style={styles.trackingText}>
                <Text style={styles.trackingTitle}>Real-time Tracking</Text>
                <Text style={styles.trackingDescription}>
                  Tracking enabled. Your location is being monitored.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.toggle, locationTracking && styles.toggleActive]}
              onPress={toggleLocationTracking}
            >
              <View style={[styles.toggleThumb, locationTracking && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleReportIncident}
              disabled={isLoading}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="warning" size={24} color="#007AFF" />
              </View>
              <Text style={styles.actionText}>Report Incident</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.panicButton]}
              onPress={handlePanicButton}
            >
              <Text style={styles.panicText}>SOS</Text>
              <Text style={styles.panicSubtext}>Panic Button</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 15,
  },
  zoneCard: {
    borderRadius: 15,
    overflow: 'hidden',
    height: 200,
  },
  zoneImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  zoneImageStyle: {
    borderRadius: 15,
  },
  zoneOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 20,
  },
  zoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zoneIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  zoneTextContainer: {
    flex: 1,
  },
  zoneName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  zoneDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  trackingCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trackingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  trackingText: {
    flex: 1,
  },
  trackingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 5,
  },
  trackingDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#007AFF',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  panicButton: {
    backgroundColor: '#FF3B30',
  },
  panicText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  panicSubtext: {
    fontSize: 12,
    color: 'white',
  },
});
