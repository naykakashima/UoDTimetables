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
        <Text style={styles.emptyText}>No timetable loaded</Text>
        <Text style={styles.emptySubtext}>Go back and enter your student ID</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Your Timetable</Text>
        <Text style={styles.eventCount}>{events.length} events</Text>
      </View>
      <Calendar
        events={events}
        height={550}
        mode="week"
        weekStartsOn={1}
        swipeEnabled={true}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4365E2",
  },
  eventCount: {
    fontSize: 14,
    color: "#808080",
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4365E2",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#808080",
    marginTop: 8,
  },
});