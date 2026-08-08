import { router } from "expo-router";
import { LogIn, UserPlus } from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Progress+</Text>
        <Text style={styles.subtitle}>Every rep counts.</Text>
      </View>

      <View style={styles.buttons}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/(auth)/login")}
        >
          <LogIn size={22} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.primaryButtonText}>Se connecter</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.outlineButton,
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

  logo: {
    width: 150,
    height: 150,
    marginBottom: 24,
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

  primaryButton: {
    height: 62,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  outlineButton: {
    height: 62,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
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
