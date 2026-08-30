import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";

import Button from "@/components/ui/Button";
import Colors from "@/constants/colors";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResetRequest() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      Alert.alert("Erreur", "Entre ton adresse e-mail.");
      return;
    }

    setLoading(true);
    const redirectTo = Linking.createURL("reset-password");
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Impossible d'envoyer l'e-mail", error.message);
      return;
    }

    Alert.alert(
      "E-mail envoyé ✉️",
      "Si un compte Progress+ utilise cette adresse, tu vas recevoir un lien pour choisir un nouveau mot de passe."
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>PROGRESS+</Text>
        <Text style={styles.title}>Mot de passe oublié ?</Text>
        <Text style={styles.subtitle}>
          Entre ton e-mail. Nous t'enverrons un lien sécurisé pour créer un nouveau mot de passe.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ton adresse e-mail"
          placeholderTextColor="#777"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />

        <Button
          title={loading ? "Envoi..." : "Recevoir le lien"}
          onPress={handleResetRequest}
        />

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          disabled={loading}
        >
          <Text style={styles.backText}>← Retour à la connexion</Text>
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
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
    marginBottom: 28,
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
    marginBottom: 18,
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