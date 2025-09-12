import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function IdentityVerificationScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [progress, setProgress] = useState(0);
  const [progressAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (user?.identityVerification?.status) {
      setVerificationStatus(user.identityVerification.status);
      
      if (user.identityVerification.status === 'verified') {
        setProgress(100);
        Animated.timing(progressAnim, {
          toValue: 100,
          duration: 1000,
          useNativeDriver: false,
        }).start();
      } else if (user.identityVerification.status === 'pending') {
        // Simulate progress for demo
        simulateProgress();
      }
    }
  }, [user]);

  const simulateProgress = () => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 70) {
          clearInterval(interval);
          return 70;
        }
        return prev + 10;
      });
    }, 2000);

    Animated.timing(progressAnim, {
      toValue: 70,
      duration: 14000,
      useNativeDriver: false,
    }).start();
  };

  const handleRefreshStatus = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      const updatedUser = response.data.user;
      updateUser(updatedUser);
      
      if (updatedUser.identityVerification.status === 'verified') {
        setVerificationStatus('verified');
        setProgress(100);
        Animated.timing(progressAnim, {
          toValue: 100,
          duration: 500,
          useNativeDriver: false,
        }).start();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh status. Please try again.');
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'verified':
        return <Ionicons name="checkmark-circle" size={60} color="#34C759" />;
      case 'rejected':
        return <Ionicons name="close-circle" size={60} color="#FF3B30" />;
      default:
        return <Ionicons name="time" size={60} color="#007AFF" />;
    }
  };

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'verified':
        return 'Verification Complete';
      case 'rejected':
        return 'Verification Rejected';
      default:
        return 'Verification in Progress';
    }
  };

  const getStatusDescription = () => {
    switch (verificationStatus) {
      case 'verified':
        return 'Your identity has been successfully verified. You can now access all features of the app.';
      case 'rejected':
        return 'Your identity verification was rejected. Please contact support for assistance.';
      default:
        return 'Your identity is being verified. This process usually takes about 15-20 minutes.';
    }
  };

  const getProgressBarColor = () => {
    switch (verificationStatus) {
      case 'verified':
        return '#34C759';
      case 'rejected':
        return '#FF3B30';
      default:
        return '#007AFF';
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
          <Text style={styles.headerTitle}>Identity Verification</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            {getStatusIcon()}
          </View>

          <Text style={styles.title}>{getStatusTitle()}</Text>
          
          <Text style={styles.description}>
            {getStatusDescription()}
          </Text>

          {verificationStatus === 'pending' && (
            <>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%'],
                        }),
                        backgroundColor: getProgressBarColor(),
                      },
                    ]}
                  />
                </View>
              </View>

              <Text style={styles.progressText}>
                Please check back later or we will notify you once it's complete.
              </Text>
            </>
          )}

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefreshStatus}
          >
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.refreshButtonText}>Refresh Status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Ionicons name="arrow-forward" size={20} color="white" />
            <Text style={styles.continueButtonText}>Continue to App</Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 30,
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 15,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
