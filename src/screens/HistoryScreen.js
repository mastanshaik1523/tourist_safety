import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { incidentsAPI } from '../services/api';

export default function HistoryScreen({ navigation }) {
  const [historyData, setHistoryData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      // Mock data for demo
      const mockHistory = {
        'Today': [
          {
            id: '1',
            type: 'incident_report',
            title: 'Reported Incident',
            time: '10:30 AM',
            status: 'reported',
          },
          {
            id: '2',
            type: 'safety_alert',
            title: 'Safety Alert',
            time: '11:45 AM',
            status: 'active',
          },
        ],
        'Yesterday': [
          {
            id: '3',
            type: 'incident_resolved',
            title: 'Incident Resolved',
            time: '02:15 PM',
            status: 'resolved',
          },
          {
            id: '4',
            type: 'incident_report',
            title: 'Reported Incident',
            time: '04:50 PM',
            status: 'reported',
          },
        ],
        'June 12, 2024': [
          {
            id: '5',
            type: 'safety_alert',
            title: 'Safety Alert',
            time: '09:00 AM',
            status: 'resolved',
          },
        ],
      };
      setHistoryData(mockHistory);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'incident_report':
        return { name: 'warning', color: '#FF9500', bgColor: '#FFF3E0' };
      case 'safety_alert':
        return { name: 'notifications', color: '#FF3B30', bgColor: '#FFEBEE' };
      case 'incident_resolved':
        return { name: 'checkmark-circle', color: '#34C759', bgColor: '#E8F5E8' };
      case 'panic_button':
        return { name: 'alert-circle', color: '#FF3B30', bgColor: '#FFEBEE' };
      default:
        return { name: 'information-circle', color: '#8E8E93', bgColor: '#F2F2F7' };
    }
  };

  const handleEventPress = (event) => {
    // Navigate to event details
    console.log('Event pressed:', event);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
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
          <Text style={styles.headerTitle}>History</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading history...</Text>
          </View>
        ) : Object.keys(historyData).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyTitle}>No History</Text>
            <Text style={styles.emptyDescription}>
              Your safety event history will appear here.
            </Text>
          </View>
        ) : (
          Object.entries(historyData).map(([date, events]) => (
            <View key={date} style={styles.dateSection}>
              <Text style={styles.dateHeader}>{date}</Text>
              {events.map((event) => {
                const icon = getEventIcon(event.type);
                return (
                  <TouchableOpacity
                    key={event.id}
                    style={styles.eventCard}
                    onPress={() => handleEventPress(event)}
                  >
                    <View style={styles.eventIconContainer}>
                      <View style={[styles.eventIcon, { backgroundColor: icon.bgColor }]}>
                        <Ionicons name={icon.name} size={20} color={icon.color} />
                      </View>
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventTime}>{event.time}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
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
    lineHeight: 24,
  },
  dateSection: {
    marginTop: 20,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 10,
    flexDirection: 'row',
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
  eventIconContainer: {
    marginRight: 15,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 5,
  },
  eventTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
});
