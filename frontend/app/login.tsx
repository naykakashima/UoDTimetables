import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/config/FirebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { router } from "expo-router";

const login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const signIn = async () => {
        try{
            const user = await signInWithEmailAndPassword(auth, email, password);
            if (user) router.replace("/(tabs)");
            } 
            catch (error: any) 
            {
            console.log("Error signing in: ", error.message);
            alert("Error signing in: " + error.message);
            }
        }
    

    const signUp = async () => {
        try{
            const user = await createUserWithEmailAndPassword(auth, email, password);
            if (user) router.replace("/(tabs)");
            } 
            catch (error: any) 
            {
            console.log("Error signing in: ", error.message);
            alert("Error signing in: " + error.message);
            }
        }
    

  return (
    <SafeAreaView>
        <Text>Login</Text>
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity onPress={signIn}>
            <Text>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={signUp}>
            <Text>Make Account</Text>
        </TouchableOpacity>
    </SafeAreaView>
  );
};

export default login;