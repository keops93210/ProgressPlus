import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import * as Linking from "expo-linking";

import Button from "@/components/ui/Button";
import Colors from "@/constants/colors";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function prepareRecoverySession() {
      try {
        const url = await Linking.getInitialURL();

        if (url) {
          const parsed = new URL(url);
          const queryCode = parsed.searchParams.get("code");

          if (queryCode) {
            await supabase.auth.exchangeCodeForSession(queryCode);
          } else if (parsed.hash) {
            const params = new URLSearchParams(parsed.hash.replace(/^#/, ""));
            const accessToken = params.get("access_token");
            const refreshToken = params.get("refresh_token");

            if (accessToken && refreshToken) {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
            }
          }
        }

        const { data } = await supabase.auth.getSession();
        if (mounted) setReady(Boolean(data.session));
      } catch {
        if (mounted) setReady(false);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    prepareRecoverySession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted && session) setReady(true);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleUpdatePassword() {
    if (password.length < 8) {
      Alert.alert("Mot de passe trop court", "Choisis un mot de passe d'au moins 8 caractères.");
      return;
    }

    if (password !== confirmation) {
      Alert.alert("Les mots de passe ne correspondent pas", "Vérifie les deux champs.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      Alert.alert("Impossible de modifier le mot de passe", error.message);
      return;
    }

    Alert.alert("Mot de passe modifié ✅", "Tu peux maintenant te connecter avec ton nouveau mot de passe.", [
      { text: "Se connecter", onPress: () => router.replace("/(auth)/login") },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>PROGRESS+</Text>
        <Text style={styles.title}>Nouveau mot de passe</Text>

        {loading ? (
          <Text style={styles.subtitle}>Vérification de ton lien sécurisé...</Text>
        ) : !ready ? (
          <>
            <Text style={styles.subtitle}>
              Ce lien est invalide ou a expiré. Demande un nouveau lien depuis l'écran de connexion.
            </Text>
            <Button title="Demander un nouveau lien" onPress={() => router.replace("/forgot-password")} />
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>Choisis un nouveau mot de passe pour sécuriser ton compte.</Text>

            <TextInput
              style={styles.input}
              placeholder="Nouveau mot de passe"
              placeholderTextColor="#777"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirmer le mot de passe"
              placeholderTextColor="#777"
              secureTextEntry
              value={confirmation}
              onChangeText={setConfirmation}
              editable={!loading}
            />

            <Button title={loading ? "Enregistrement..." : "Enregistrer le nouveau mot de passe"} onPress={handleUpdatePassword} />
          </>
        )}

        <Pressable
          onPress={() => router.replace("/(auth)/login")}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
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
    marginBottom: 14,
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