import { router } from "expo-router";
import { ArrowRight, LogIn, Sparkles } from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.brandRow}>
        <View style={styles.brandMark}><Sparkles size={16} color={Colors.primaryLight} strokeWidth={2.5} /></View>
        <Text style={styles.brand}>PROGRESS+</Text>
      </View>

      <View style={styles.hero}>
        <View style={styles.logoShell}>
          <View style={styles.logoGlow} />
          <Image source={require("@/assets/images/icon.png")} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={styles.eyebrow}>TON ENTRAÎNEMENT. TA PROGRESSION.</Text>
        <Text style={styles.title}>Deviens plus fort.{"\n"}<Text style={styles.titleAccent}>À chaque séance.</Text></Text>
        <Text style={styles.subtitle}>Progress+ transforme chacune de tes séries en données utiles pour t'aider à progresser intelligemment.</Text>

        <View style={styles.proofRow}>
          <View style={styles.proof}><Text style={styles.proofValue}>01</Text><Text style={styles.proofLabel}>Suis</Text></View>
          <View style={styles.divider} />
          <View style={styles.proof}><Text style={styles.proofValue}>02</Text><Text style={styles.proofLabel}>Analyse</Text></View>
          <View style={styles.divider} />
          <View style={styles.proof}><Text style={styles.proofValue}>03</Text><Text style={styles.proofLabel}>Progresse</Text></View>
        </View>
      </View>

      <View style={styles.buttons}>
        <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]} onPress={() => router.push("/(auth)/login")}>
          <View style={styles.buttonIcon}><LogIn size={18} color="#FFFFFF" strokeWidth={2.5} /></View>
          <Text style={styles.primaryButtonText}>Se connecter</Text>
          <ArrowRight size={19} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>

        <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]} onPress={() => router.push("/(auth)/register")}>
          <Text style={styles.secondaryButtonText}>Créer mon compte</Text>
          <ArrowRight size={18} color={Colors.primaryLight} strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.footer}>EVERY REP COUNTS.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 28, paddingTop: 54, paddingBottom: 30, overflow: "hidden" },
  glowTop: { position: "absolute", width: 360, height: 360, borderRadius: 180, backgroundColor: "rgba(139,92,246,0.12)", top: -190, right: -120 },
  glowBottom: { position: "absolute", width: 300, height: 300, borderRadius: 150, backgroundColor: "rgba(139,92,246,0.07)", bottom: -190, left: -130 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  brandMark: { width: 30, height: 30, borderRadius: 10, backgroundColor: "rgba(139,92,246,0.14)", borderWidth: 1, borderColor: "rgba(167,139,250,0.28)", alignItems: "center", justifyContent: "center" },
  brand: { color: Colors.primaryLight, fontSize: 12, fontWeight: "900", letterSpacing: 2.2 },
  hero: { flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 12 },
  logoShell: { width: 142, height: 142, alignItems: "center", justifyContent: "center", marginBottom: 30 },
  logoGlow: { position: "absolute", width: 126, height: 126, borderRadius: 63, backgroundColor: "rgba(139,92,246,0.16)" },
  logo: { width: 112, height: 112, borderRadius: 28 },
  eyebrow: { color: Colors.primaryLight, fontSize: 10, fontWeight: "900", letterSpacing: 1.7, textAlign: "center", marginBottom: 14 },
  title: { color: Colors.text, fontSize: 42, lineHeight: 46, fontWeight: "900", letterSpacing: -1.5, textAlign: "center" },
  titleAccent: { color: Colors.primaryLight },
  subtitle: { maxWidth: 560, marginTop: 18, color: Colors.textSecondary, fontSize: 15, lineHeight: 23, fontWeight: "500", textAlign: "center" },
  proofRow: { marginTop: 34, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.025)", borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingVertical: 14, paddingHorizontal: 20 },
  proof: { minWidth: 78, alignItems: "center" },
  proofValue: { color: Colors.primaryLight, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  proofLabel: { color: Colors.text, fontSize: 12, fontWeight: "800", marginTop: 4 },
  divider: { width: 1, height: 25, backgroundColor: Colors.border, marginHorizontal: 8 },
  buttons: { gap: 11 },
  primaryButton: { height: 60, borderRadius: 18, backgroundColor: Colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 18, shadowColor: Colors.primary, shadowOpacity: 0.28, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  buttonIcon: { position: "absolute", left: 20 },
  primaryButtonText: { flex: 1, color: "#FFFFFF", fontSize: 16, fontWeight: "900", textAlign: "center" },
  secondaryButton: { height: 56, borderRadius: 18, borderWidth: 1, borderColor: "rgba(167,139,250,0.32)", backgroundColor: Colors.surface, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 },
  secondaryButtonText: { color: Colors.text, fontSize: 15, fontWeight: "800" },
  footer: { color: Colors.textMuted, fontSize: 8, fontWeight: "900", letterSpacing: 2, textAlign: "center", marginTop: 7 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
});
