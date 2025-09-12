import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');

  const WelcomeScreen = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Smart Tourist</Text>
        <Text style={styles.subtitle}>Your Safety, Our Priority</Text>
        <Text style={styles.description}>
          Explore with confidence. Our AI-powered system monitors your surroundings in real-time, ensuring a safe and enjoyable journey.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setCurrentScreen('dashboard')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const DashboardScreen = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Safety Dashboard</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Safety Zone</Text>
          <View style={styles.zoneCard}>
            <Text style={styles.zoneName}>Green Zone</Text>
            <Text style={styles.zoneDescription}>
              Low risk area. Enjoy your visit with standard precautions.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Report Incident', 'Incident reporting feature')}
          >
            <Text style={styles.actionButtonText}>Report Incident</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.panicButton]}
            onPress={() => Alert.alert('Emergency', 'Panic button activated!')}
          >
            <Text style={styles.panicButtonText}>SOS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navigation}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentScreen('welcome')}
          >
            <Text style={styles.navButtonText}>Back to Welcome</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <>
      <StatusBar style="auto" />
      {currentScreen === 'welcome' ? <WelcomeScreen /> : <DashboardScreen />}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#007AFF',
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
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 15,
  },
  zoneCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  zoneName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 5,
  },
  zoneDescription: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  actionButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  panicButton: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  panicButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  navigation: {
    marginTop: 20,
  },
  navButton: {
    backgroundColor: '#8E8E93',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  navButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
