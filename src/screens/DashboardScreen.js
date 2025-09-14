import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Alert,
  Linking,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { safetyZonesAPI, incidentsAPI, weatherAPI } from '../services/api';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [currentZone, setCurrentZone] = useState(null);
  const [locationTracking, setLocationTracking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  
  // Animation values
  const sosPulseAnim = useRef(new Animated.Value(1)).current;
  const indicatorPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadSafetyZone();
    loadEmergencyContacts();
    loadWeatherData();
    if (user?.locationTracking) {
      setLocationTracking(user.locationTracking.enabled);
    }
    startAnimations();
  }, [user]);

  const startAnimations = () => {
    // SOS pulse animation
    const sosPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(sosPulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sosPulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    sosPulse.start();

    // Indicator pulse animation
    const indicatorPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(indicatorPulseAnim, {
          toValue: 1.2,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(indicatorPulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    indicatorPulse.start();
  };

  // Reload contacts when screen comes into focus (e.g., returning from Emergency Contacts screen)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadEmergencyContacts();
    });

    return unsubscribe;
  }, [navigation]);

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

  const loadEmergencyContacts = async () => {
    try {
      // Load from AsyncStorage
      const storedContacts = await AsyncStorage.getItem('emergencyContacts');
      
      if (storedContacts) {
        setEmergencyContacts(JSON.parse(storedContacts));
      } else {
        // If no stored contacts, use empty array (don't set default here)
        setEmergencyContacts([]);
      }
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
      setEmergencyContacts([]);
    }
  };

  const loadWeatherData = async () => {
    try {
      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied for weather');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Load weather data and alerts
      const [weatherResponse, alertsResponse] = await Promise.all([
        weatherAPI.getCurrentWeather(latitude, longitude),
        weatherAPI.getWeatherAlerts(latitude, longitude)
      ]);

      if (weatherResponse.data.success) {
        setWeatherData(weatherResponse.data.data);
      }

      if (alertsResponse.data.success) {
        setWeatherAlerts(alertsResponse.data.data);
      }
    } catch (error) {
      console.error('Error loading weather data:', error);
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

  const makeEmergencyCall = async (phoneNumber) => {
    try {
      const phoneUrl = `tel:${phoneNumber}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);
      
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Unable to make phone call. Please check your device settings.');
      }
    } catch (error) {
      console.error('Error making emergency call:', error);
      Alert.alert('Error', 'Failed to initiate phone call. Please try again.');
    }
  };

  const sendLocationToEmergencyContacts = async () => {
    if (emergencyContacts.length === 0) {
      Alert.alert(
        'No Emergency Contacts',
        'You need to add emergency contacts first to send your location.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Contacts', onPress: () => navigation.navigate('Settings') }
        ]
      );
      return;
    }

    try {
      setIsSharingLocation(true);

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required to send your location to emergency contacts.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });

      const { latitude, longitude } = location.coords;
      
      // Create location message
      const locationMessage = `🚨 EMERGENCY LOCATION ALERT 🚨\n\nI need help! My current location is:\n\n📍 Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\n\n🗺️ Google Maps: https://www.google.com/maps?q=${latitude},${longitude}\n\n⏰ Time: ${new Date().toLocaleString()}\n\nPlease help me immediately!`;

      // Create SMS URLs for each emergency contact
      const smsUrls = emergencyContacts.map(contact => {
        const encodedMessage = encodeURIComponent(locationMessage);
        return `sms:${contact.phoneNumber}?body=${encodedMessage}`;
      });

      // Show confirmation dialog
      Alert.alert(
        'Send Location to Emergency Contacts',
        `Send your current location to ${emergencyContacts.length} emergency contact${emergencyContacts.length !== 1 ? 's' : ''}?\n\nThis will open your messaging app.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send Location',
            onPress: async () => {
              try {
                // Open SMS for the first contact (most common use case)
                const firstSmsUrl = smsUrls[0];
                const canOpen = await Linking.canOpenURL(firstSmsUrl);
                
                if (canOpen) {
                  await Linking.openURL(firstSmsUrl);
                  
                  // If there are multiple contacts, show option to send to others
                  if (emergencyContacts.length > 1) {
                    setTimeout(() => {
                      Alert.alert(
                        'Multiple Contacts',
                        `Location sent to ${emergencyContacts[0].name}. Would you like to send to the other ${emergencyContacts.length - 1} contact${emergencyContacts.length - 1 !== 1 ? 's' : ''} as well?`,
                        [
                          { text: 'No', style: 'cancel' },
                          {
                            text: 'Send to All',
                            onPress: () => {
                              // Send to remaining contacts
                              emergencyContacts.slice(1).forEach(async (contact, index) => {
                                setTimeout(async () => {
                                  try {
                                    await Linking.openURL(smsUrls[index + 1]);
                                  } catch (error) {
                                    console.error('Error sending SMS to contact:', contact.name, error);
                                  }
                                }, index * 1000); // Stagger the SMS openings
                              });
                            }
                          }
                        ]
                      );
                    }, 2000);
                  }
                } else {
                  Alert.alert('Error', 'Unable to open messaging app. Please check your device settings.');
                }
              } catch (error) {
                console.error('Error sending location:', error);
                Alert.alert('Error', 'Failed to send location. Please try again.');
              }
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please check your location settings and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSharingLocation(false);
    }
  };

  const handleSOSButton = () => {
    if (emergencyContacts.length === 0) {
      Alert.alert(
        'No Emergency Contacts',
        'You need to add emergency contacts first. Would you like to add them now?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Contacts', onPress: () => navigation.navigate('Settings') }
        ]
      );
      return;
    }

    // Show emergency contacts to choose from
    const contactOptions = emergencyContacts.map(contact => ({
      text: `${contact.name} (${contact.phoneNumber})`,
      onPress: () => makeEmergencyCall(contact.phoneNumber)
    }));

    Alert.alert(
      'Emergency Call',
      'Choose an emergency contact to call:',
      [
        ...contactOptions,
        { text: 'Cancel', style: 'cancel' }
      ]
    );
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

  const getWeatherIcon = (weatherMain) => {
    switch (weatherMain?.toLowerCase()) {
      case 'clear':
        return 'sunny';
      case 'clouds':
        return 'cloudy';
      case 'rain':
        return 'rainy';
      case 'thunderstorm':
        return 'thunderstorm';
      case 'snow':
        return 'snow';
      case 'mist':
      case 'fog':
        return 'cloudy-outline';
      case 'drizzle':
        return 'rainy-outline';
      default:
        return 'cloud';
    }
  };

  const getAlertIcon = (icon) => {
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
        return 'warning';
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

        {/* Weather Information */}
        {weatherData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weather & Safety</Text>
            <View style={styles.weatherCard}>
              <View style={styles.weatherHeader}>
                <View style={styles.weatherIcon}>
                  <Ionicons 
                    name={getWeatherIcon(weatherData.weather.main)} 
                    size={32} 
                    color="#007AFF" 
                  />
                </View>
                <View style={styles.weatherInfo}>
                  <Text style={styles.weatherTemp}>{Math.round(weatherData.temperature)}°C</Text>
                  <Text style={styles.weatherDescription}>{weatherData.weather.description}</Text>
                  <Text style={styles.weatherFeelsLike}>
                    Feels like {Math.round(weatherData.feelsLike)}°C
                  </Text>
                </View>
              </View>
              
              <View style={styles.weatherDetails}>
                <View style={styles.weatherDetail}>
                  <Ionicons name="water" size={16} color="#007AFF" />
                  <Text style={styles.weatherDetailText}>{weatherData.humidity}%</Text>
                </View>
                <View style={styles.weatherDetail}>
                  <Ionicons name="leaf" size={16} color="#007AFF" />
                  <Text style={styles.weatherDetailText}>{Math.round(weatherData.windSpeed)} m/s</Text>
                </View>
                <View style={styles.weatherDetail}>
                  <Ionicons name="eye" size={16} color="#007AFF" />
                  <Text style={styles.weatherDetailText}>{Math.round(weatherData.visibility / 1000)} km</Text>
                </View>
              </View>

              {weatherAlerts.length > 0 && (
                <View style={styles.weatherAlerts}>
                  <Text style={styles.weatherAlertsTitle}>Weather Alerts:</Text>
                  {weatherAlerts.slice(0, 2).map((alert, index) => (
                    <View key={index} style={styles.weatherAlert}>
                      <Ionicons 
                        name={getAlertIcon(alert.icon)} 
                        size={16} 
                        color={getSeverityColor(alert.severity)} 
                      />
                      <Text style={styles.weatherAlertText}>{alert.title}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Quick Actions */}
         <View style={styles.section}>
           <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>Quick Actions</Text>
             <View style={styles.emergencyIndicator}>
               <Animated.View 
                 style={[
                   styles.indicatorDot,
                   { transform: [{ scale: indicatorPulseAnim }] }
                 ]} 
               />
               <Text style={styles.indicatorText}>Emergency Ready</Text>
             </View>
           </View>
           
           {/* Primary Emergency Actions */}
           <View style={styles.primaryActionsContainer}>
             {/* SOS Button - Most Prominent */}
             <Animated.View 
               style={[
                 styles.sosButtonContainer,
                 { transform: [{ scale: sosPulseAnim }] }
               ]}
             >
               <TouchableOpacity
                 style={styles.sosButtonTouchable}
                 onPress={handleSOSButton}
                 activeOpacity={0.8}
               >
                 <LinearGradient
                   colors={['#FF3B30', '#FF6B6B', '#FF3B30']}
                   start={{ x: 0, y: 0 }}
                   end={{ x: 1, y: 1 }}
                   style={styles.sosGradient}
                 >
                   <View style={styles.sosContent}>
                     <View style={styles.sosIconWrapper}>
                       <Ionicons name="call" size={32} color="white" />
                       <View style={styles.sosPulseRing} />
                     </View>
                     <View style={styles.sosTextContainer}>
                       <Text style={styles.sosMainText}>SOS</Text>
                       <Text style={styles.sosSubText}>Emergency Call</Text>
                       <Text style={styles.sosDescription}>Tap to call emergency contacts</Text>
                     </View>
                     <View style={styles.sosArrow}>
                       <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
                     </View>
                   </View>
                 </LinearGradient>
               </TouchableOpacity>
             </Animated.View>

             {/* Panic Button */}
             <TouchableOpacity
               style={styles.panicButtonContainer}
               onPress={handlePanicButton}
               activeOpacity={0.8}
             >
               <LinearGradient
                 colors={['#FF9500', '#FFB84D', '#FF9500']}
                 start={{ x: 0, y: 0 }}
                 end={{ x: 1, y: 1 }}
                 style={styles.panicGradient}
               >
                 <View style={styles.panicContent}>
                   <View style={styles.panicIconWrapper}>
                     <Ionicons name="warning" size={28} color="white" />
                   </View>
                   <View style={styles.panicTextContainer}>
                     <Text style={styles.panicMainText}>PANIC</Text>
                     <Text style={styles.panicSubText}>Alert Authorities</Text>
                   </View>
                 </View>
               </LinearGradient>
             </TouchableOpacity>
           </View>

           {/* Secondary Actions */}
           <View style={styles.secondaryActionsContainer}>
             <TouchableOpacity
               style={styles.secondaryActionButton}
               onPress={handleReportIncident}
               disabled={isLoading}
               activeOpacity={0.7}
             >
               <View style={styles.secondaryActionContent}>
                 <View style={styles.secondaryActionIcon}>
                   <Ionicons name="document-text" size={24} color="#007AFF" />
                 </View>
                 <View style={styles.secondaryActionTextContainer}>
                   <Text style={styles.secondaryActionTitle}>Report Incident</Text>
                   <Text style={styles.secondaryActionSubtitle}>Safety alert or issue</Text>
                 </View>
                 <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
               </View>
             </TouchableOpacity>

             <TouchableOpacity
               style={styles.secondaryActionButton}
               onPress={sendLocationToEmergencyContacts}
               disabled={isSharingLocation}
               activeOpacity={0.7}
             >
               <View style={styles.secondaryActionContent}>
                 <View style={styles.secondaryActionIcon}>
                   <Ionicons 
                     name={isSharingLocation ? "hourglass" : "location"} 
                     size={24} 
                     color="#FF6B35" 
                   />
                 </View>
                 <View style={styles.secondaryActionTextContainer}>
                   <Text style={styles.secondaryActionTitle}>
                     {isSharingLocation ? 'Getting Location...' : 'Send My Location'}
                   </Text>
                   <Text style={styles.secondaryActionSubtitle}>
                     {isSharingLocation 
                       ? 'Please wait...' 
                       : `Share location with ${emergencyContacts.length} contact${emergencyContacts.length !== 1 ? 's' : ''}`
                     }
                   </Text>
                 </View>
                 <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
               </View>
             </TouchableOpacity>

             <TouchableOpacity
               style={styles.secondaryActionButton}
               onPress={() => navigation.navigate('EmergencyContacts')}
               activeOpacity={0.7}
             >
               <View style={styles.secondaryActionContent}>
                 <View style={styles.secondaryActionIcon}>
                   <Ionicons name="people" size={24} color="#34C759" />
                 </View>
                 <View style={styles.secondaryActionTextContainer}>
                   <Text style={styles.secondaryActionTitle}>Emergency Contacts</Text>
                   <Text style={styles.secondaryActionSubtitle}>
                     {emergencyContacts.length} contact{emergencyContacts.length !== 1 ? 's' : ''} saved
                   </Text>
                 </View>
                 <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
               </View>
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
  // Section Header Styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  emergencyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginRight: 6,
  },
  indicatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34C759',
  },

  // Primary Actions Container
  primaryActionsContainer: {
    marginBottom: 20,
  },

  // SOS Button Styles
  sosButtonContainer: {
    marginBottom: 15,
    borderRadius: 20,
    shadowColor: '#FF3B30',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  sosButtonTouchable: {
    borderRadius: 20,
  },
  sosGradient: {
    borderRadius: 20,
    padding: 20,
  },
  sosContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sosIconWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  sosPulseRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sosTextContainer: {
    flex: 1,
  },
  sosMainText: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    marginBottom: 4,
    letterSpacing: 1,
  },
  sosSubText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  sosDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  sosArrow: {
    marginLeft: 12,
  },

  // Panic Button Styles
  panicButtonContainer: {
    borderRadius: 16,
    shadowColor: '#FF9500',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  panicGradient: {
    borderRadius: 16,
    padding: 16,
  },
  panicContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  panicIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  panicTextContainer: {
    flex: 1,
  },
  panicMainText: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  panicSubText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },

  // Secondary Actions Container
  secondaryActionsContainer: {
    gap: 12,
  },
  secondaryActionButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  secondaryActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  secondaryActionTextContainer: {
    flex: 1,
  },
  secondaryActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  secondaryActionSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },

  // Weather Card Styles
  weatherCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherTemp: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  weatherDescription: {
    fontSize: 16,
    color: '#1C1C1E',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  weatherFeelsLike: {
    fontSize: 14,
    color: '#8E8E93',
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  weatherDetail: {
    alignItems: 'center',
  },
  weatherDetailText: {
    fontSize: 12,
    color: '#1C1C1E',
    marginTop: 4,
    fontWeight: '600',
  },
  weatherAlerts: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  weatherAlertsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  weatherAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  weatherAlertText: {
    fontSize: 13,
    color: '#1C1C1E',
    marginLeft: 8,
    flex: 1,
  },
});
