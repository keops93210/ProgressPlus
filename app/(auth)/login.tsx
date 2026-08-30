import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
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
      <View style={styles.content}>
        <Text style={styles.eyebrow}>PROGRESS+</Text>
        <Text style={styles.title}>Connexion</Text>
        <Text style={styles.subtitle}>Reprends là où tu t'es arrêté.</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#777"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
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

        <Pressable
          onPress={() => router.push("/(auth)/forgot-password")}
          style={({ pressed }) => [styles.forgot, pressed && styles.pressed]}
        >
          <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
        </Pressable>

        <Button title="Se connecter" onPress={handleLogin} />

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Text style={styles.backText}>← Retour</Text>
        </Pressable>
      </View>
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
  content: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  eyebrow: {
    color: Colors.primaryLight,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 10,
  },
  title: {
    color: Colors.text,
    fontSize: 36,
    fontWeight: "900",
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    marginTop: 8,
    marginBottom: 30,
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
    marginBottom: 14,
  },
  forgot: {
    alignSelf: "flex-end",
    paddingVertical: 4,
    paddingHorizontal: 2,
    marginBottom: 18,
  },
  forgotText: {
    color: Colors.primaryLight,
    fontSize: 14,
    fontWeight: "800",
  },
  back: {
    alignSelf: "center",
    marginTop: 22,
    padding: 8,
  },
  backText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.65,
  },
});