import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function CreateAccountScreen({ navigation }) {
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    nationality: '',
    passportId: '',
    phoneNumber: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Helper function for input styles
  const getInputStyle = () => ({
    backgroundColor: '#F2F2F7',
    color: '#1C1C1E',
    borderColor: 'transparent'
  });

  const getTextStyle = () => ({
    color: '#1C1C1E'
  });

  const getPlaceholderColor = () => '#8E8E93';

  const handleNext = async () => {
    // Basic validation
    const requiredFields = ['fullName', 'email', 'password', 'nationality', 'passportId', 'phoneNumber', 'emergencyContactName', 'emergencyContactNumber'];
    const missingFields = requiredFields.filter(field => !formData[field].trim());
    
    if (missingFields.length > 0) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register(formData);
      if (result.success) {
        navigation.navigate('IdentityVerification');
      } else {
        Alert.alert('Registration Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="#F2F2F7" />
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>Step 1 of 5</Text>
          <Text style={[styles.currentStep, { color: '#007AFF' }]}>Personal Info</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Personal Information */}
          <View style={styles.section}>
            <TextInput
              style={[styles.input, getInputStyle()]}
              placeholder="Full Name"
              placeholderTextColor={getPlaceholderColor()}
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
            />
            <TextInput
              style={[styles.input, getInputStyle()]}
              placeholder="Nationality"
              placeholderTextColor={getPlaceholderColor()}
              value={formData.nationality}
              onChangeText={(value) => handleInputChange('nationality', value)}
            />
            <TextInput
              style={[styles.input, getInputStyle()]}
              placeholder="Passport/ID Number"
              placeholderTextColor={getPlaceholderColor()}
              value={formData.passportId}
              onChangeText={(value) => handleInputChange('passportId', value)}
            />
            <TextInput
              style={[styles.input, getInputStyle()]}
              placeholder="Email"
              placeholderTextColor={getPlaceholderColor()}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.input, getInputStyle()]}
              placeholder="Password"
              placeholderTextColor={getPlaceholderColor()}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
            />
            <TextInput
              style={[styles.input, getInputStyle()]}
              placeholder="Phone Number"
              placeholderTextColor={getPlaceholderColor()}
              value={formData.phoneNumber}
              onChangeText={(value) => handleInputChange('phoneNumber', value)}
              keyboardType="phone-pad"
            />
          </View>

          {/* Emergency Contact */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, getTextStyle()]}>Emergency Contact</Text>
            <TextInput
              style={[styles.input, getInputStyle()]}
              placeholder="Emergency Contact Name"
              placeholderTextColor={getPlaceholderColor()}
              value={formData.emergencyContactName}
              onChangeText={(value) => handleInputChange('emergencyContactName', value)}
            />
            <TextInput
              style={[styles.input, getInputStyle()]}
              placeholder="Emergency Contact Number"
              placeholderTextColor={getPlaceholderColor()}
              value={formData.emergencyContactNumber}
              onChangeText={(value) => handleInputChange('emergencyContactNumber', value)}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.nextButton, isLoading && styles.disabledButton]}
            onPress={handleNext}
            disabled={isLoading}
          >
            <Text style={styles.nextButtonText}>
              {isLoading ? 'Creating Account...' : 'Next'}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.disclaimer, { color: '#8E8E93' }]}>
            By proceeding, you agree to our{' '}
            <Text style={[styles.link, { color: '#007AFF' }]}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={[styles.link, { color: '#007AFF' }]}>Privacy Policy.</Text>
          </Text>
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
  progressContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  currentStep: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    width: '20%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1C1C1E',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 50,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 50,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#8E8E93',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});
