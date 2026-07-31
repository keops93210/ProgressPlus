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
import { signUp } from "@/services/auth.service";

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister() {
    try {
      if (!firstName || !lastName || !email || !password) {
        Alert.alert("Erreur", "Merci de remplir tous les champs.");
        return;
      }

      await signUp(firstName, lastName, email, password);

      Alert.alert("Succès", "Compte créé avec succès !");

      router.replace("/(app)/home");
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>

      <TextInput
        style={styles.input}
        placeholder="Prénom"
        placeholderTextColor="#777"
        value={firstName}
        onChangeText={setFirstName}
      />

      <TextInput
        style={styles.input}
        placeholder="Nom"
        placeholderTextColor="#777"
        value={lastName}
        onChangeText={setLastName}
      />

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
        title="Créer mon compte"
        onPress={handleRegister}
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