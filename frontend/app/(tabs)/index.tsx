import { SafeAreaView, StyleSheet, TextInput, TouchableOpacity, Text, Keyboard, View, Alert } from "react-native";
import { useState } from "react";
import { router } from 'expo-router';

export default function TabOneScreen() {
  const [studentId, setStudentId] = useState("");
  const apiUrl = process.env.EXPO_PUBLIC_API_IP;

  const handleSubmit = async () => {
    Keyboard.dismiss();

    if (!studentId) {
      Alert.alert("Please enter a student ID");
      return;
    }

    try {
      const response = await fetch(`http://${apiUrl}:8080/api/timetable/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch timetable');
      }

      const data = await response.json();
      console.log("Fetched timetable:", data);

      router.push({
        pathname: '/(tabs)/four',
        params: { timetable: JSON.stringify(data) },
      });
      
    } catch (error) {
      console.error(error);
      Alert.alert("Error fetching timetable");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Welcome Back!</Text>
      <Text style={styles.subHeader}>Please enter your student ID to continue</Text>
      <View style={styles.accentLine} />

      <TextInput
        placeholder="Student ID"
        value={studentId}
        onChangeText={setStudentId}
        placeholderTextColor="#808080"
        style={styles.input}
        keyboardType="number-pad"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4365E2",
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    color: "#808080",
    marginBottom: 12,
    textAlign: "center",
  },
  accentLine: {
    width: 60,
    height: 4,
    backgroundColor: "#4365E2",
    borderRadius: 2,
    marginBottom: 25,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#4365E2",
    color: "#000",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#4365E2",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});