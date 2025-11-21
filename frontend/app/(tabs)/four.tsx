import { SafeAreaView, Text, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from 'expo-router';
import { Calendar } from "react-native-big-calendar";

export default function TabTwoScreen() {
  const { timetable } = useLocalSearchParams<{ timetable: string }>();
  
  const parsedTimetable = timetable ? JSON.parse(timetable) : [];
  
  const events = parsedTimetable.map((event: any) => ({
    title: `${event.title} (${event.moduleCode})`,
    start: new Date(event.startTime),
    end: new Date(event.endTime),
  }));

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
        headerContainerStyle={{ backgroundColor: "#FFFFFF" }}
        hourStyle={{ color: "#808080" }}
        eventCellStyle={{ backgroundColor: "#4365E2", borderRadius: 6 }}
      />
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
});
