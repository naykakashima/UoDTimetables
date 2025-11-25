import { SafeAreaView, StyleSheet, TextInput, TouchableOpacity, Text, Keyboard, View, Alert, Modal, ActivityIndicator } from "react-native";
import { useState } from "react";
import { router } from 'expo-router';
import { useTimetableStore } from '@/utils/timetableStore';

export default function TabOneScreen() {
  const [studentId, setStudentId] = useState("");
  const [hasFetched, setHasFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const apiUrl = process.env.EXPO_PUBLIC_API_IP;

  const handleSubmit = async () => {
    if (hasFetched) return;

    Keyboard.dismiss();

    if (!studentId) {
      Alert.alert("Please enter a student ID");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`http://${apiUrl}:8080/api/timetable/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });

      if (!response.ok) throw new Error('Failed to fetch timetable');

      const data = await response.json();
      console.log("Fetched timetable:", data);

      useTimetableStore.getState().setTimetable(data);
      setHasFetched(true);

      router.push({
        pathname: '/(tabs)/four',
        params: { timetable: JSON.stringify(data) },
      });

    } catch (error) {
      console.error(error);
      Alert.alert("Error fetching timetable");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Welcome Back!</Text>
      <Text style={styles.subHeader}>Enter your student ID to continue</Text>
      <View style={styles.accentLine} />

      <View style={styles.formCard}>
        <TextInput
          placeholder="Student ID"
          value={studentId}
          onChangeText={setStudentId}
          placeholderTextColor="#9A9A9A"
          style={styles.input}
          keyboardType="number-pad"
          editable={!hasFetched && !isLoading}
        />

        <TouchableOpacity
          style={[
            styles.button,
            (hasFetched || isLoading) && styles.buttonDisabled
          ]}
          disabled={hasFetched || isLoading}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>
            {hasFetched ? "Timetable Retrieved" : "Continue"}
          </Text>
        </TouchableOpacity>

        {hasFetched && (
          <Text style={styles.fetchedBadge}>✓ Timetable has been retrieved</Text>
        )}
      </View>

      {/* Loading Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isLoading}
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#4365E2" />
            <Text style={styles.loadingText}>Fetching your timetable...</Text>
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
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  header: {
    fontSize: 34,
    fontWeight: "800",
    color: "#4365E2",
    marginBottom: 6,
  },

  subHeader: {
    fontSize: 15,
    color: "#6F6F6F",
    marginBottom: 10,
    textAlign: "center",
  },

  accentLine: {
    width: 70,
    height: 3,
    backgroundColor: "#4365E2",
    borderRadius: 10,
    marginBottom: 30,
    opacity: 0.7,
  },

  formCard: {
    width: "100%",
    padding: 20,
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
    alignItems: "center",
  },

  input: {
    width: "100%",
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#D0D7FF",
    color: "#000",
  },

  button: {
    width: "100%",
    height: 52,
    backgroundColor: "#4365E2",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonDisabled: {
    backgroundColor: "#9BA6D1",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },

  fetchedBadge: {
    marginTop: 12,
    color: "#2ECC71",
    fontSize: 16,
    fontWeight: "500",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
    minWidth: 200,
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#4365E2",
    fontWeight: "500",
  },
});