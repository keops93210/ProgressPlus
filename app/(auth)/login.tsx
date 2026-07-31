import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
} from "react-native";

import Button from "@/components/ui/Button";
import Colors from "@/constants/colors";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Erreur", "Merci de remplir tous les champs.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert("Erreur", error.message);
      return;
    }

    Alert.alert("Bienvenue 👋", "Connexion réussie !");

    router.replace("/(app)/home");
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#777"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#777"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button
        title="Se connecter"
        onPress={handleLogin}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    padding: 24,
  },

  title: {
    color: Colors.text,
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 40,
  },

  input: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    color: Colors.text,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
});