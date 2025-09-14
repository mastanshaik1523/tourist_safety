import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

export default function EmergencyContactsScreen({ navigation }) {
  const { user } = useAuth();
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    relationship: 'Emergency Contact'
  });

  useEffect(() => {
    loadEmergencyContacts();
  }, []);

  const loadEmergencyContacts = async () => {
    try {
      setIsLoading(true);
      
      // Try to load from AsyncStorage first
      const storedContacts = await AsyncStorage.getItem('emergencyContacts');
      
      if (storedContacts) {
        // If we have stored contacts, use them
        setEmergencyContacts(JSON.parse(storedContacts));
      } else {
        // If no stored contacts, initialize with default data
        const defaultContacts = [
          { _id: '1', name: 'Emergency Services', phoneNumber: '911', relationship: 'Emergency' },
          { _id: '2', name: 'Family Contact', phoneNumber: '+1234567890', relationship: 'Family' },
          { _id: '3', name: 'Friend', phoneNumber: '+0987654321', relationship: 'Friend' }
        ];
        setEmergencyContacts(defaultContacts);
        // Save default contacts to storage
        await AsyncStorage.setItem('emergencyContacts', JSON.stringify(defaultContacts));
      }
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
      Alert.alert('Error', 'Failed to load emergency contacts.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      phoneNumber: '',
      relationship: 'Emergency Contact'
    });
    setModalVisible(true);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phoneNumber: contact.phoneNumber,
      relationship: contact.relationship
    });
    setModalVisible(true);
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
          onPress: () => deleteContact(contactId)
        }
      ]
    );
  };

  const saveContactsToStorage = async (contacts) => {
    try {
      await AsyncStorage.setItem('emergencyContacts', JSON.stringify(contacts));
    } catch (error) {
      console.error('Error saving contacts to storage:', error);
    }
  };

  const deleteContact = async (contactId) => {
    try {
      const updatedContacts = emergencyContacts.filter(contact => contact._id !== contactId);
      setEmergencyContacts(updatedContacts);
      await saveContactsToStorage(updatedContacts);
      Alert.alert('Success', 'Emergency contact deleted successfully.');
    } catch (error) {
      console.error('Error deleting contact:', error);
      Alert.alert('Error', 'Failed to delete emergency contact.');
    }
  };

  const handleSaveContact = async () => {
    if (!formData.name.trim() || !formData.phoneNumber.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      let updatedContacts;
      
      if (editingContact) {
        // Update existing contact
        updatedContacts = emergencyContacts.map(contact => 
          contact._id === editingContact._id 
            ? { ...contact, ...formData }
            : contact
        );
        setEmergencyContacts(updatedContacts);
        Alert.alert('Success', 'Emergency contact updated successfully.');
      } else {
        // Add new contact
        const newContact = {
          _id: Date.now().toString(),
          ...formData
        };
        updatedContacts = [...emergencyContacts, newContact];
        setEmergencyContacts(updatedContacts);
        Alert.alert('Success', 'Emergency contact added successfully.');
      }
      
      // Save to AsyncStorage
      await saveContactsToStorage(updatedContacts);
      
      setModalVisible(false);
      setFormData({
        name: '',
        phoneNumber: '',
        relationship: 'Emergency Contact'
      });
    } catch (error) {
      console.error('Error saving contact:', error);
      Alert.alert('Error', 'Failed to save emergency contact.');
    }
  };

  const makeCall = async (phoneNumber) => {
    try {
      const { Linking } = require('react-native');
      const phoneUrl = `tel:${phoneNumber}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);
      
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Unable to make phone call. Please check your device settings.');
      }
    } catch (error) {
      console.error('Error making call:', error);
      Alert.alert('Error', 'Failed to initiate phone call.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="#F2F2F7" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emergency Contacts</Text>
          <TouchableOpacity onPress={handleAddContact}>
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {emergencyContacts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="call-outline" size={64} color="#8E8E93" />
              <Text style={styles.emptyTitle}>No Emergency Contacts</Text>
              <Text style={styles.emptyDescription}>
                Add emergency contacts to quickly call them in case of emergency.
              </Text>
              <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
                <Text style={styles.addButtonText}>Add First Contact</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.contactsList}>
              {emergencyContacts.map((contact) => (
                <View key={contact._id} style={styles.contactCard}>
                  <View style={styles.contactInfo}>
                    <View style={styles.contactIcon}>
                      <Ionicons name="person" size={24} color="#007AFF" />
                    </View>
                    <View style={styles.contactDetails}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>
                      <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                    </View>
                  </View>
                  <View style={styles.contactActions}>
                    <TouchableOpacity
                      style={styles.callButton}
                      onPress={() => makeCall(contact.phoneNumber)}
                    >
                      <Ionicons name="call" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditContact(contact)}
                    >
                      <Ionicons name="pencil" size={20} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteContact(contact._id)}
                    >
                      <Ionicons name="trash" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Add/Edit Contact Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#1C1C1E" />
                </TouchableOpacity>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                    placeholder="Enter contact name"
                    placeholderTextColor="#8E8E93"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.phoneNumber}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
                    placeholder="Enter phone number"
                    placeholderTextColor="#8E8E93"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Relationship</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.relationship}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, relationship: text }))}
                    placeholder="e.g., Family, Friend, Doctor"
                    placeholderTextColor="#8E8E93"
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveContact}
                >
                  <Text style={styles.saveButtonText}>
                    {editingContact ? 'Update' : 'Add'} Contact
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  contactsList: {
    paddingTop: 20,
  },
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactDetails: {
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
    color: '#007AFF',
    marginBottom: 3,
  },
  contactRelationship: {
    fontSize: 12,
    color: '#8E8E93',
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  form: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1C1C1E',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
