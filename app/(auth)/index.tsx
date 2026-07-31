import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Dumbbell } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Button from "@/components/ui/Button";
import Colors from "@/constants/colors";

export default function WelcomeScreen() {
  return (
    <LinearGradient
      colors={["#0F1113", "#15191D", "#0F1113"]}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Dumbbell
            size={42}
            color={Colors.primary}
            strokeWidth={2.5}
          />
        </View>

        <Text style={styles.title}>Progress+</Text>

        <Text style={styles.subtitle}>
          Every rep counts.
        </Text>
      </View>

      <View style={styles.buttons}>
        <Button
          title="COMMENCER"
          onPress={() => router.push("/(auth)/register")}
        />

        <Pressable onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.link}>
            Se connecter
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push("/(auth)/register")}>
          <Text style={styles.link}>
            Créer un compte
          </Text>
        </Pressable>

        <Text style={styles.guest}>
          Continuer en invité
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 30,
    paddingTop: 120,
    paddingBottom: 60,
  },

  logoContainer: {
    alignItems: "center",
  },

  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1D20",
    borderWidth: 1,
    borderColor: "#2B2F33",
    marginBottom: 30,
  },

  title: {
    color: Colors.text,
    fontSize: 40,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: 17,
  },

  buttons: {
    gap: 18,
  },

  link: {
    textAlign: "center",
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
  },

  guest: {
    textAlign: "center",
    color: Colors.textMuted,
    marginTop: 8,
    fontSize: 15,
  },
});