import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="#F2F2F7" />
      <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>TourShield</Text>
        <View style={styles.profileIcon}>
          <Ionicons name="person-outline" size={24} color="#007AFF" />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <View style={styles.peopleGroup}>
              {/* People walking illustration */}
              <View style={styles.person1} />
              <View style={styles.person2} />
              <View style={styles.person3} />
              <View style={styles.person4} />
              <View style={styles.person5} />
              <View style={styles.person6} />
              <View style={styles.person7} />
            </View>
            
            {/* City background */}
            <View style={styles.cityBackground}>
              <View style={styles.building1} />
              <View style={styles.building2} />
              <View style={styles.building3} />
              <View style={styles.building4} />
              <View style={styles.building5} />
            </View>
            
            {/* Digital overlay */}
            <View style={styles.digitalOverlay}>
              <Text style={styles.digitalText}>NENMBME SAFET!</Text>
              <Text style={styles.digitalText}>81ΟΔΑΓΕΤΥ</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Your Safety, Our Priority</Text>

          {/* Description */}
          <Text style={styles.description}>
            Explore with confidence. Our AI-powered system monitors your surroundings in real-time, ensuring a safe and enjoyable journey.
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={() => navigation.navigate('CreateAccount')}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>

             <TouchableOpacity
               style={styles.loginButton}
               onPress={() => navigation.navigate('Login')}
             >
               <Text style={styles.loginButtonText}>Already have an account? </Text>
               <Text style={styles.loginButtonLink}>Sign In</Text>
             </TouchableOpacity>
          </View>
        </View>
      </View>
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
    paddingTop: 10,
  },
  headerText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  illustrationContainer: {
    height: 200,
    marginBottom: 30,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 15,
  },
  peopleGroup: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  person1: {
    width: 12,
    height: 30,
    backgroundColor: '#FF9500',
    borderRadius: 6,
  },
  person2: {
    width: 8,
    height: 20,
    backgroundColor: '#FF9500',
    borderRadius: 4,
  },
  person3: {
    width: 12,
    height: 32,
    backgroundColor: '#8E8E93',
    borderRadius: 6,
  },
  person4: {
    width: 8,
    height: 18,
    backgroundColor: '#FF9500',
    borderRadius: 4,
  },
  person5: {
    width: 12,
    height: 28,
    backgroundColor: '#8E8E93',
    borderRadius: 6,
  },
  person6: {
    width: 12,
    height: 30,
    backgroundColor: '#FF9500',
    borderRadius: 6,
  },
  person7: {
    width: 12,
    height: 28,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  cityBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
  },
  building1: {
    width: 20,
    height: 80,
    backgroundColor: '#E3F2FD',
    borderRadius: 2,
  },
  building2: {
    width: 25,
    height: 120,
    backgroundColor: '#BBDEFB',
    borderRadius: 2,
  },
  building3: {
    width: 18,
    height: 100,
    backgroundColor: '#E3F2FD',
    borderRadius: 2,
  },
  building4: {
    width: 22,
    height: 90,
    backgroundColor: '#BBDEFB',
    borderRadius: 2,
  },
  building5: {
    width: 20,
    height: 110,
    backgroundColor: '#E3F2FD',
    borderRadius: 2,
  },
  digitalOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
  },
  digitalText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 'bold',
    opacity: 0.7,
    marginBottom: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  buttonContainer: {
    gap: 16,
  },
  getStartedButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  loginButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  loginButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '400',
  },
  loginButtonLink: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
