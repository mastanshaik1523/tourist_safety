import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { MAP_CONFIG } from '../config/maps';

export default function MapScreen() {
  const mapRef = useRef(null);
  
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [mapRegion, setMapRegion] = useState(MAP_CONFIG.DEFAULT_REGION);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setIsLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000,
        maximumAge: 30000,
      });
      
      setLocation(location);
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: MAP_CONFIG.DEFAULT_REGION.latitudeDelta,
        longitudeDelta: MAP_CONFIG.DEFAULT_REGION.longitudeDelta,
      };
      
      setMapRegion(newRegion);
      
      // Animate to location if map is ready
      if (mapRef.current && mapReady) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    } catch (error) {
      console.error('Location error:', error);
      setErrorMsg('Error getting location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapPress = (event) => {
    try {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      Alert.alert(
        'Location Selected',
        `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
        [
          { text: 'Report Incident', onPress: () => reportIncidentAtLocation(latitude, longitude) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Error handling map press:', error);
    }
  };

  const reportIncidentAtLocation = (latitude, longitude) => {
    // Navigate to incident reporting with pre-filled location
    Alert.alert('Report Incident', 'Incident reporting feature would open here with the selected location.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="#F2F2F7" />
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Safety Map</Text>
          <TouchableOpacity onPress={getCurrentLocation} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Ionicons name="locate" size={24} color="#007AFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mapContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>
              Loading map...
            </Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            region={mapRegion}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={false}
            loadingEnabled={true}
            loadingIndicatorColor="#007AFF"
            loadingBackgroundColor="#F2F2F7"
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
            onMapReady={() => {
              console.log('Map is ready');
              setMapReady(true);
              // If we have location, animate to it
              if (location) {
                setTimeout(() => {
                  mapRef.current?.animateToRegion(mapRegion, 1000);
                }, 500);
              }
            }}
            onError={(error) => {
              console.error('Map error:', error);
              setErrorMsg('Map failed to load. Please try again.');
            }}
            onLayout={() => {
              console.log('Map layout completed');
            }}
            moveOnMarkerPress={false}
            showsCompass={true}
            showsScale={true}
            showsBuildings={true}
            showsTraffic={false}
            showsIndoors={true}
            showsPointsOfInterest={true}
            mapType="standard"
          >
          {/* Safety Zones - Only render if we have a valid location */}
          {location && (
            <Circle
              center={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              radius={1000}
              strokeColor={MAP_CONFIG.ZONE_COLORS.green.stroke}
              fillColor={MAP_CONFIG.ZONE_COLORS.green.fill}
              strokeWidth={2}
            />
          )}

          {/* Sample incident markers - Only render if we have a valid location */}
          {location && (
            <>
              <Marker
                coordinate={{
                  latitude: location.coords.latitude + 0.005,
                  longitude: location.coords.longitude + 0.005,
                }}
                title="Safety Alert"
                description="Reported incident in this area"
                onPress={() => {
                  Alert.alert(
                    'Safety Alert',
                    'Reported incident in this area. Would you like to report another incident?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Report', onPress: () => reportIncidentAtLocation(location.coords.latitude + 0.005, location.coords.longitude + 0.005) }
                    ]
                  );
                }}
              >
                <View style={[styles.incidentMarker, { backgroundColor: MAP_CONFIG.INCIDENT_COLORS.safety_alert }]}>
                  <Ionicons name="warning" size={20} color="white" />
                </View>
              </Marker>

              <Marker
                coordinate={{
                  latitude: location.coords.latitude - 0.003,
                  longitude: location.coords.longitude + 0.008,
                }}
                title="Emergency Services"
                description="Police station nearby"
                onPress={() => {
                  Alert.alert(
                    'Emergency Services',
                    'Police station nearby. Would you like to call emergency services?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Call 911', onPress: () => {
                        const phoneUrl = 'tel:911';
                        import('react-native').then(({ Linking }) => {
                          Linking.openURL(phoneUrl).catch(err => {
                            console.error('Error opening phone:', err);
                            Alert.alert('Error', 'Unable to make phone call using your SIM. Please call 911 manually.');
                          });
                        });
                      }}
                    ]
                  );
                }}
              >
                <View style={[styles.emergencyMarker, { backgroundColor: MAP_CONFIG.EMERGENCY_COLORS.police }]}>
                  <Ionicons name="shield" size={20} color="white" />
                </View>
              </Marker>
            </>
          )}
          </MapView>
        )}

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => Alert.alert('Filter', 'Safety zone filter options')}
          >
            <Ionicons name="filter" size={20} color="#007AFF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => Alert.alert('Layers', 'Map layer options')}
          >
            <Ionicons name="layers" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: MAP_CONFIG.ZONE_COLORS.green.stroke }]} />
            <Text style={styles.legendText}>Safe Zone</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: MAP_CONFIG.ZONE_COLORS.yellow.stroke }]} />
            <Text style={styles.legendText}>Caution Zone</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: MAP_CONFIG.ZONE_COLORS.red.stroke }]} />
            <Text style={styles.legendText}>High Risk Zone</Text>
          </View>
        </View>
      </View>

      {errorMsg && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setErrorMsg(null);
              getCurrentLocation();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
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
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'column',
  },
  controlButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendText: {
    fontSize: 12,
    color: '#1C1C1E',
  },
  incidentMarker: {
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyMarker: {
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
});
