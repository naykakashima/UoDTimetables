import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/config/FirebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { router } from "expo-router";

const welcome = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = async () => {
    try{
      const user = await signInWithEmailAndPassword(auth, email, password);
      if (user) router.replace("/(tabs)");
    } catch (error: any) {
      console.log("Error signing in: ", error.message);
      alert("Error signing in: " + error.message);
    }
  }

  const signUp = async () => {
    try{
      const user = await createUserWithEmailAndPassword(auth, email, password);
      if (user) router.replace("/(tabs)");
    } catch (error: any) {
      console.log("Error signing in: ", error.message);
      alert("Error signing in: " + error.message);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../assets/images/UoDTimetables Logo Black Text.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Welcome</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#808080"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#808080"
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={signIn}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.signUpButton]} onPress={signUp}>
        <Text style={[styles.buttonText, { color: "#4365E2" }]}>Make Account</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4365E2",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
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
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  signUpButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#4365E2",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default welcome;
