import { SafeAreaView, Text, StyleSheet, View, Modal, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams } from 'expo-router';
import { Calendar } from "react-native-big-calendar";
import { useState } from "react";

export default function TabTwoScreen() {
  const { timetable } = useLocalSearchParams<{ timetable: string }>();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const parsedTimetable = timetable ? JSON.parse(timetable) : [];
  
  const events = parsedTimetable.map((event: any) => ({
    ...event,
    title: `${event.title} (${event.moduleCode})`,
    start: new Date(event.startTime),
    end: new Date(event.endTime),
  }));

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
        <Text style={styles.headerText}>Your Timetable</Text>
        <View style={styles.accentLine} />
        <Text style={styles.eventCount}>{events.length} events</Text>
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