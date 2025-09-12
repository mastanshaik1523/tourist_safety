import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { emergencyContactsAPI } from '../services/api';

export default function SettingsScreen({ navigation }) {
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [privacySettings, setPrivacySettings] = useState({
    locationTracking: true,
    safetyAlerts: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEmergencyContacts();
  }, []);

  const loadEmergencyContacts = async () => {
    try {
      setIsLoading(true);
      // Mock data for demo
      const mockContacts = [
        {
          _id: '1',
          name: 'Ethan Carter',
          phoneNumber: '+1-555-123-4567',
          relationship: 'Emergency Contact',
        },
        {
          _id: '2',
          name: 'Sophia Clark',
          phoneNumber: '+1-555-987-6543',
          relationship: 'Emergency Contact',
        },
      ];
      setEmergencyContacts(mockContacts);
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = () => {
    Alert.prompt(
      'Add Emergency Contact',
      'Enter contact name:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Next',
          onPress: (name) => {
            if (name) {
              Alert.prompt(
                'Add Emergency Contact',
                'Enter phone number:',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Add',
                    onPress: (phoneNumber) => {
                      if (phoneNumber) {
                        const newContact = {
                          _id: Date.now().toString(),
                          name,
                          phoneNumber,
                          relationship: 'Emergency Contact',
                        };
                        setEmergencyContacts(prev => [...prev, newContact]);
                      }
                    }
                  }
                ],
                'plain-text',
                '',
                'phone-pad'
              );
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleEditContact = (contact) => {
    Alert.prompt(
      'Edit Contact',
      'Enter new name:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Next',
          onPress: (name) => {
            if (name) {
              Alert.prompt(
                'Edit Contact',
                'Enter new phone number:',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Save',
                    onPress: (phoneNumber) => {
                      if (phoneNumber) {
                        setEmergencyContacts(prev =>
                          prev.map(c => 
                            c._id === contact._id 
                              ? { ...c, name, phoneNumber }
                              : c
                          )
                        );
                      }
                    }
                  }
                ],
                'plain-text',
                contact.phoneNumber,
                'phone-pad'
              );
            }
          }
        }
      ],
      'plain-text',
      contact.name
    );
  };

  const handleDeleteContact = (contactId) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setEmergencyContacts(prev => prev.filter(c => c._id !== contactId));
          }
        }
      ]
    );
  };

  const togglePrivacySetting = (setting) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="#F2F2F7" />
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Emergency Contacts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          
          {emergencyContacts.map((contact) => (
            <View key={contact._id} style={styles.contactCard}>
              <View style={styles.contactAvatar}>
                <Text style={styles.contactAvatarText}>
                  {contact.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>
              </View>
              <View style={styles.contactActions}>
                <TouchableOpacity
                  onPress={() => handleEditContact(contact)}
                  style={styles.actionButton}
                >
                  <Ionicons name="pencil" size={16} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteContact(contact._id)}
                  style={styles.actionButton}
                >
                  <Ionicons name="trash" size={16} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addContactButton}
            onPress={handleAddContact}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.addContactText}>Add New Contact</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Location Tracking</Text>
              <Text style={styles.settingDescription}>
                Allow tracking for non-critical areas
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                privacySettings.locationTracking && styles.toggleActive
              ]}
              onPress={() => togglePrivacySetting('locationTracking')}
            >
              <View style={[
                styles.toggleThumb,
                privacySettings.locationTracking && styles.toggleThumbActive
              ]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Safety Alerts</Text>
              <Text style={styles.settingDescription}>
                Receive safety updates and notifications
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                privacySettings.safetyAlerts && styles.toggleActive
              ]}
              onPress={() => togglePrivacySetting('safetyAlerts')}
            >
              <View style={[
                styles.toggleThumb,
                privacySettings.safetyAlerts && styles.toggleThumbActive
              ]} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 5,
  },
  contactPhone: {
    fontSize: 14,
    color: '#8E8E93',
  },
  contactActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
  addContactButton: {
    backgroundColor: '#007AFF',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  addContactText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingItem: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 5,
  },
  settingDescription: {
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
});
