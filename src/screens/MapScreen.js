import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { MAP_CONFIG } from '../config/maps';
import Constants from 'expo-constants';

export default function MapScreen() {
  const mapRef = useRef(null);
  
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [mapRegion, setMapRegion] = useState(MAP_CONFIG.FALLBACK_REGION);
  const [mapError, setMapError] = useState(false);
  
  // Zone placement states
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [selectedZoneType, setSelectedZoneType] = useState(null);
  const [zoneMessage, setZoneMessage] = useState('');
  const [placedZones, setPlacedZones] = useState([]);
  const [isPlacingZone, setIsPlacingZone] = useState(false);

  // Get Google Maps API key from app config
  const getGoogleMapsApiKey = () => {
    try {
      // Try to get from app config first
      const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey || 
                    Constants.expoConfig?.ios?.config?.googleMapsApiKey ||
                    Constants.expoConfig?.android?.config?.googleMaps?.apiKey ||
                    MAP_CONFIG.API_KEY;
      return apiKey;
    } catch (error) {
      console.warn('Error getting API key from config:', error);
      return MAP_CONFIG.API_KEY;
    }
  };

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
        latitudeDelta: MAP_CONFIG.FALLBACK_REGION.latitudeDelta,
        longitudeDelta: MAP_CONFIG.FALLBACK_REGION.longitudeDelta,
      };
      
      setMapRegion(newRegion);
      
      // Animate to location if map is ready
      if (mapRef.current && mapReady) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    } catch (error) {
      console.error('Location error:', error);
      setErrorMsg('Error getting location. Using default location.');
      // Set to fallback region if location fails
      setMapRegion(MAP_CONFIG.FALLBACK_REGION);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapPress = (event) => {
    try {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      
      if (isPlacingZone) {
        // If in zone placement mode, show zone selection modal
        setSelectedLocation({ latitude, longitude });
        setShowZoneModal(true);
      } else {
        // Normal map interaction
        Alert.alert(
          'Location Selected',
          `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
          [
            { text: 'Report Incident', onPress: () => reportIncidentAtLocation(latitude, longitude) },
            { text: 'Place Zone', onPress: () => {
              setSelectedLocation({ latitude, longitude });
              setShowZoneModal(true);
            }},
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      console.error('Error handling map press:', error);
    }
  };

  const reportIncidentAtLocation = (latitude, longitude) => {
    // Navigate to incident reporting with pre-filled location
    Alert.alert('Report Incident', 'Incident reporting feature would open here with the selected location.');
  };

  // Zone placement functions
  const handleZoneTypeSelection = (zoneType) => {
    setSelectedZoneType(zoneType);
  };

  const handlePlaceZone = () => {
    if (!selectedZoneType || !selectedLocation) {
      Alert.alert('Error', 'Please select a zone type and location.');
      return;
    }

    const newZone = {
      id: Date.now().toString(),
      type: selectedZoneType,
      coordinate: selectedLocation,
      message: zoneMessage || getDefaultZoneMessage(selectedZoneType),
      timestamp: new Date().toISOString(),
    };

    setPlacedZones(prev => [...prev, newZone]);
    setShowZoneModal(false);
    setSelectedZoneType(null);
    setZoneMessage('');
    setSelectedLocation(null);
    setIsPlacingZone(false);

    Alert.alert('Success', 'Zone placed successfully!');
  };

  const getDefaultZoneMessage = (zoneType) => {
    const messages = {
      green: 'Safe area - No restrictions',
      yellow: 'Caution zone - Be aware of surroundings',
      red: 'High risk area - Avoid if possible'
    };
    return messages[zoneType] || 'Zone information';
  };

  const getZoneIcon = (zoneType) => {
    const icons = {
      green: 'checkmark-circle',
      yellow: 'warning',
      red: 'close-circle'
    };
    return icons[zoneType] || 'help-circle';
  };

  const handleZoneMarkerPress = (zone) => {
    Alert.alert(
      `${zone.type.charAt(0).toUpperCase() + zone.type.slice(1)} Zone`,
      zone.message,
      [
        { text: 'OK', style: 'default' },
        { text: 'Remove', style: 'destructive', onPress: () => removeZone(zone.id) }
      ]
    );
  };

  const removeZone = (zoneId) => {
    setPlacedZones(prev => prev.filter(zone => zone.id !== zoneId));
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
        {isLoading || mapError ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>
              {mapError ? 'Map loading failed' : 'Loading map...'}
            </Text>
            {mapError && (
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => {
                  setMapError(false);
                  setErrorMsg(null);
                  setIsLoading(true);
                  getCurrentLocation();
                }}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            )}
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
            googleMapsApiKey={getGoogleMapsApiKey()}
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
              setMapError(true);
              setErrorMsg('Map failed to load. Please check your internet connection and try again.');
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

          {/* Placed Zone Markers */}
          {placedZones.map((zone) => (
            <Marker
              key={zone.id}
              coordinate={zone.coordinate}
              title={`${zone.type.charAt(0).toUpperCase() + zone.type.slice(1)} Zone`}
              description={zone.message}
              onPress={() => handleZoneMarkerPress(zone)}
            >
              <View style={[
                styles.zoneMarker, 
                { backgroundColor: MAP_CONFIG.ZONE_COLORS[zone.type]?.stroke || '#8E8E93' }
              ]}>
                <Ionicons name={getZoneIcon(zone.type)} size={24} color="white" />
              </View>
            </Marker>
          ))}

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
            style={[styles.controlButton, isPlacingZone && styles.activeControlButton]}
            onPress={() => setIsPlacingZone(!isPlacingZone)}
          >
            <Ionicons name="add-circle" size={20} color={isPlacingZone ? "white" : "#007AFF"} />
          </TouchableOpacity>
          
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

      {/* Zone Selection Modal */}
      <Modal
        visible={showZoneModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowZoneModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Place Safety Zone</Text>
              <TouchableOpacity
                onPress={() => setShowZoneModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.sectionTitle}>Select Zone Type:</Text>
              
              {/* Zone Type Selection */}
              <View style={styles.zoneTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.zoneTypeButton,
                    selectedZoneType === 'green' && styles.selectedZoneTypeButton
                  ]}
                  onPress={() => handleZoneTypeSelection('green')}
                >
                  <View style={[styles.zoneTypeIndicator, { backgroundColor: MAP_CONFIG.ZONE_COLORS.green.stroke }]} />
                  <View style={styles.zoneTypeInfo}>
                    <Text style={styles.zoneTypeTitle}>Green Zone</Text>
                    <Text style={styles.zoneTypeDescription}>Safe area - No restrictions</Text>
                  </View>
                  {selectedZoneType === 'green' && (
                    <Ionicons name="checkmark-circle" size={24} color={MAP_CONFIG.ZONE_COLORS.green.stroke} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.zoneTypeButton,
                    selectedZoneType === 'yellow' && styles.selectedZoneTypeButton
                  ]}
                  onPress={() => handleZoneTypeSelection('yellow')}
                >
                  <View style={[styles.zoneTypeIndicator, { backgroundColor: MAP_CONFIG.ZONE_COLORS.yellow.stroke }]} />
                  <View style={styles.zoneTypeInfo}>
                    <Text style={styles.zoneTypeTitle}>Yellow Zone</Text>
                    <Text style={styles.zoneTypeDescription}>Caution zone - Be aware of surroundings</Text>
                  </View>
                  {selectedZoneType === 'yellow' && (
                    <Ionicons name="checkmark-circle" size={24} color={MAP_CONFIG.ZONE_COLORS.yellow.stroke} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.zoneTypeButton,
                    selectedZoneType === 'red' && styles.selectedZoneTypeButton
                  ]}
                  onPress={() => handleZoneTypeSelection('red')}
                >
                  <View style={[styles.zoneTypeIndicator, { backgroundColor: MAP_CONFIG.ZONE_COLORS.red.stroke }]} />
                  <View style={styles.zoneTypeInfo}>
                    <Text style={styles.zoneTypeTitle}>Red Zone</Text>
                    <Text style={styles.zoneTypeDescription}>High risk area - Avoid if possible</Text>
                  </View>
                  {selectedZoneType === 'red' && (
                    <Ionicons name="checkmark-circle" size={24} color={MAP_CONFIG.ZONE_COLORS.red.stroke} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Custom Message Input */}
              <Text style={styles.sectionTitle}>Custom Message (Optional):</Text>
              <TextInput
                style={styles.messageInput}
                placeholder="Enter custom message for this zone..."
                value={zoneMessage}
                onChangeText={setZoneMessage}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
              />

              {/* Location Info */}
              {selectedLocation && (
                <View style={styles.locationInfo}>
                  <Text style={styles.sectionTitle}>Selected Location:</Text>
                  <Text style={styles.locationText}>
                    Lat: {selectedLocation.latitude.toFixed(6)}
                  </Text>
                  <Text style={styles.locationText}>
                    Lng: {selectedLocation.longitude.toFixed(6)}
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowZoneModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.placeButton, !selectedZoneType && styles.disabledButton]}
                onPress={handlePlaceZone}
                disabled={!selectedZoneType}
              >
                <Text style={styles.placeButtonText}>Place Zone</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  // Zone marker styles
  zoneMarker: {
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // Active control button style
  activeControlButton: {
    backgroundColor: '#007AFF',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 15,
    marginTop: 10,
  },
  zoneTypeContainer: {
    marginBottom: 20,
  },
  zoneTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    marginBottom: 10,
    backgroundColor: 'white',
  },
  selectedZoneTypeButton: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  zoneTypeIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 15,
  },
  zoneTypeInfo: {
    flex: 1,
  },
  zoneTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  zoneTypeDescription: {
    fontSize: 14,
    color: '#666',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#1C1C1E',
    backgroundColor: 'white',
    minHeight: 80,
    marginBottom: 20,
  },
  locationInfo: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  placeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#E5E5EA',
  },
  placeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
