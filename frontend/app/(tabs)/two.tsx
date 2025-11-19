import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, TouchableOpacity, Text } from "react-native";
import { auth } from "@/config/FirebaseConfig";
import { router } from "expo-router";

export default function TabTwoScreen() {

  // redirect if not logged in
  auth.onAuthStateChanged((user) => {
    if (!user) router.replace("/welcome");
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <Text style={styles.subtitle}>You are logged in</Text>

      <TouchableOpacity style={styles.button} onPress={() => auth.signOut()}>
        <Text style={styles.buttonText}>Sign Out</Text>
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
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4365E2",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#808080",
    marginBottom: 30,
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
