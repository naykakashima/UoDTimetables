import { SafeAreaView, Text, StyleSheet, View, Modal, TouchableOpacity, ScrollView, Animated, Share, Alert } from "react-native";
import { useLocalSearchParams } from 'expo-router';
import { Calendar } from "react-native-big-calendar";
import { useState, useRef, useEffect } from "react";
import { useTimetableStore } from '@/utils/timetableStore';
import * as FileSystem from 'expo-file-system/legacy';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function TabTwoScreen() {
  const { timetable } = useLocalSearchParams<{ timetable: string }>();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const storedTimetable = useTimetableStore((state) => state.timetable);
  
  const parsedTimetable = timetable ? JSON.parse(timetable) : storedTimetable;
  
  const events = parsedTimetable.map((event: any) => ({
    ...event,
    title: `${event.title} (${event.moduleCode})`,
    start: new Date(event.startTime),
    end: new Date(event.endTime),
  }));

  // Toggle card state
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [isCardExpanded, setIsCardExpanded] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Find all events in the next 24 hours
  useEffect(() => {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const upcoming = events.filter((e: any) => {
      return e.start >= now && e.start <= next24Hours;
    });
    
    upcoming.sort((a: any, b: any) => a.start.getTime() - b.start.getTime());
    setUpcomingEvents(upcoming);
  }, [timetable, storedTimetable]);

  // Animate card slide
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isCardExpanded ? 0 : 120,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isCardExpanded]);

  const handleEventPress = (event: any) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const exportToICS = async () => {
  try {
    // Generate ICS content
    let icsContent = 'BEGIN:VCALENDAR\n';
    icsContent += 'VERSION:2.0\n';
    icsContent += 'PRODID:-//UoDTimetables//EN\n';
    icsContent += 'CALSCALE:GREGORIAN\n';
    icsContent += 'METHOD:PUBLISH\n';
    icsContent += 'X-WR-CALNAME:University of Dundee Timetable\n';
    icsContent += 'X-WR-TIMEZONE:Europe/London\n';

    events.forEach((event: any) => {
      const formatICSDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      icsContent += 'BEGIN:VEVENT\n';
      icsContent += `UID:${event.moduleCode}-${event.start.getTime()}@uodtimetables.com\n`;
      icsContent += `DTSTAMP:${formatICSDate(new Date())}\n`;
      icsContent += `DTSTART:${formatICSDate(event.start)}\n`;
      icsContent += `DTEND:${formatICSDate(event.end)}\n`;
      icsContent += `SUMMARY:${event.title}\n`;
      icsContent += `LOCATION:${event.location}\n`;
      icsContent += `DESCRIPTION:${event.description}\\nWeek ${event.weekNumber}\n`;
      icsContent += 'STATUS:CONFIRMED\n';
      icsContent += 'SEQUENCE:0\n';
      icsContent += 'END:VEVENT\n';
    });

    icsContent += 'END:VCALENDAR';

    // Create a proper file path in the cache directory
    const fileName = 'uod_timetable.ics';
    const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
    
    // Write the file
    await FileSystem.writeAsStringAsync(fileUri, icsContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/calendar',
        dialogTitle: 'Export Timetable',
        UTI: 'public.calendar-event', // iOS uniform type identifier
      });
    } else {
      Alert.alert('Export Successful', 'Timetable saved to device');
    }
  } catch (error) {
    console.error('Export error:', error);
    Alert.alert('Export Failed', 'Unable to export timetable. Please try again.');
  }
};

  if (events.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No timetable loaded</Text>
          <Text style={styles.emptySubtext}>Go back and enter your student ID</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerText}>Your Timetable</Text>
            <View style={styles.accentLine} />
            <Text style={styles.eventCount}>{events.length} events</Text>
          </View>
          <TouchableOpacity 
            style={styles.exportButton}
            onPress={exportToICS}
            activeOpacity={0.7}
          >
            <Text style={styles.exportIcon}>⬆️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Calendar
        events={events}
        height={550}
        mode="week"
        weekStartsOn={1}
        swipeEnabled={true}
        onPressEvent={handleEventPress}
        headerContainerStyle={{ backgroundColor: "#FFFFFF" }}
        hourStyle={{ color: "#808080" }}
        eventCellStyle={{ backgroundColor: "#4365E2", borderRadius: 6 }}
      />

      {/* Toggle upcoming events card */}
      <Animated.View
        style={[
          styles.swipeCard,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <TouchableOpacity 
          onPress={() => setIsCardExpanded(!isCardExpanded)}
          style={styles.cardHeader}
          activeOpacity={0.7}
        >
          <View style={styles.swipeHandle} />
          <Text style={styles.toggleIndicator}>{isCardExpanded ? '▼' : '▲'}</Text>
        </TouchableOpacity>
        
        {isCardExpanded && (
          <ScrollView style={styles.cardScrollView} showsVerticalScrollIndicator={false}>
            {upcomingEvents.length > 0 ? (
              <>
                <Text style={styles.cardLabel}>
                  {upcomingEvents.length} {upcomingEvents.length === 1 ? 'Class' : 'Classes'} in Next 24hrs
                </Text>
                {upcomingEvents.map((event: any, index: number) => (
                  <View key={`${event.moduleCode}-${index}`} style={styles.eventItem}>
                    <Text style={styles.cardTitle}>{event.title.replace(` (${event.moduleCode})`, '')}</Text>
                    <Text style={styles.cardLocation}>📍 {event.location}</Text>
                    <Text style={styles.cardTime}>
                      ⏰ {formatTime(event.start)} - {formatTime(event.end)}
                    </Text>
                    <Text style={styles.cardDate}>
                      📅 {formatDate(event.start)}
                    </Text>
                    {index < upcomingEvents.length - 1 && <View style={styles.eventDivider} />}
                  </View>
                ))}
              </>
            ) : (
              <View style={styles.cardContent}>
                <Text style={styles.noEventEmoji}>📅</Text>
                <Text style={styles.noEventText}>No classes scheduled</Text>
                <Text style={styles.noEventSubtext}>in the next 24 hours</Text>
              </View>
            )}
          </ScrollView>
        )}
      </Animated.View>

      {/* Event detail modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedEvent && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.moduleCode}>{selectedEvent.moduleCode}</Text>
                    <TouchableOpacity 
                      onPress={() => setModalVisible(false)}
                      style={styles.closeButton}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.modalTitle}>{selectedEvent.title.replace(` (${selectedEvent.moduleCode})`, '')}</Text>

                  <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>📅 Date</Text>
                      <Text style={styles.infoValue}>
                        {formatDate(selectedEvent.start)}
                      </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>⏰ Time</Text>
                      <Text style={styles.infoValue}>
                        {formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}
                      </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>📍 Location</Text>
                      <Text style={styles.infoValue}>{selectedEvent.location}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>👨‍🏫 Details</Text>
                      <Text style={styles.infoValue}>{selectedEvent.description}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>📚 Week</Text>
                      <Text style={styles.infoValue}>Week {selectedEvent.weekNumber}</Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4365E2",
  },

  accentLine: {
    width: 60,
    height: 3,
    backgroundColor: "#4365E2",
    borderRadius: 2,
    marginVertical: 6,
    opacity: 0.8,
  },

  eventCount: {
    fontSize: 14,
    color: "#4365E2",
    fontWeight: "500",
  },

  exportButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4365E2",
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4365E2',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },

  exportIcon: {
    fontSize: 24,
  },

  emptyContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  emptyCard: {
    backgroundColor: "#F9F9F9",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4365E2",
  },

  emptySubtext: {
    fontSize: 14,
    color: "#808080",
    marginTop: 8,
    textAlign: "center",
  },

  // Swipeable card styles
  swipeCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 100,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 12,
    elevation: 10,
    maxHeight: 400,
  },

  cardHeader: {
    alignItems: 'center',
    paddingVertical: 5,
  },

  swipeHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#D0D0D0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 8,
  },

  toggleIndicator: {
    fontSize: 18,
    color: '#4365E2',
    fontWeight: 'bold',
  },

  cardScrollView: {
    maxHeight: 250,
  },

  cardContent: {
    paddingBottom: 10,
  },

  cardLabel: {
    fontSize: 13,
    color: '#808080',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },

  eventItem: {
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4365E2',
    marginBottom: 6,
  },

  cardLocation: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },

  cardTime: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },

  cardDate: {
    fontSize: 13,
    color: '#808080',
  },

  eventDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 16,
  },

  noEventEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 12,
  },

  noEventText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },

  noEventSubtext: {
    fontSize: 14,
    color: '#808080',
    textAlign: 'center',
    marginTop: 4,
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
    padding: 24,
    maxHeight: '80%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  moduleCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4365E2',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButtonText: {
    fontSize: 20,
    color: '#808080',
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4365E2',
    marginBottom: 20,
  },

  infoSection: {
    gap: 0,
  },

  infoRow: {
    paddingVertical: 12,
  },

  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#808080',
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 22,
  },

  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
});