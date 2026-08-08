import { router } from "expo-router";
import {
  Dumbbell,
  LogIn,
  UserPlus,
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Button from "@/components/ui/Button";
import Colors from "@/constants/colors";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Dumbbell
            size={44}
            color={Colors.primary}
            strokeWidth={2.5}
          />
        </View>

        <Text style={styles.title}>Progress+</Text>
        <Text style={styles.subtitle}>Every rep counts.</Text>
      </View>

      <View style={styles.buttons}>
        <Button
          title="COMMENCER"
          onPress={() => router.push("/(auth)/register")}
        />

        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>OU</Text>
          <View style={styles.separatorLine} />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.outlineButton,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/(auth)/login")}
        >
          <LogIn size={22} color={Colors.primary} strokeWidth={2.4} />
          <Text style={styles.outlineButtonText}>Se connecter</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.outlineButton,
            styles.secondaryButton,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/(auth)/register")}
        >
          <UserPlus size={22} color={Colors.primary} strokeWidth={2.4} />
          <Text style={styles.outlineButtonText}>Créer un compte</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    paddingTop: 110,
    paddingBottom: 44,
  },

  logoContainer: {
    alignItems: "center",
  },

  logoCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1.5,
    borderColor: "#E4D9FF",
    marginBottom: 28,
  },

  title: {
    color: Colors.primary,
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: -1.5,
  },

  subtitle: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 18,
    fontWeight: "500",
  },

  buttons: {
    gap: 14,
  },

  separator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginVertical: 2,
  },

  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },

  separatorText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },

  outlineButton: {
    height: 62,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },

  secondaryButton: {
    borderColor: Colors.border,
  },

  outlineButtonText: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: "700",
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
});
