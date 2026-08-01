import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/ui/Button";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const { user, signOut } = useAuth();

  async function handleLogout() {
    try {
      await signOut();
      Alert.alert("Déconnecté", "À bientôt 👋");
    } catch {
      Alert.alert("Erreur", "Impossible de se déconnecter.");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mon profil</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>

        <Text style={styles.email}>
          {user?.email ?? "Non connecté"}
        </Text>
      </View>

      <Button
        title="SE DÉCONNECTER"
        onPress={handleLogout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },

  title: {
    color: Colors.text,
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 30,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 20,
    marginBottom: 30,
  },

  label: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },

  email: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
});