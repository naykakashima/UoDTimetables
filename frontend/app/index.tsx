import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native";
import { useState } from "react";

const index = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const signIn = async () => {
        // Sign in logic will go here
    }

    const signUp = async () => {
        // Sign up logic will go here
    }

  return (
    <SafeAreaView>
        <Text>Welcome to UoD Timetables App!</Text>
    </SafeAreaView>
  );
}