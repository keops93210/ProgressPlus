import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";

interface ProgressPlusLaunchProps {
  onFinished: () => void;
}

export default function ProgressPlusLaunch({ onFinished }: ProgressPlusLaunchProps) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const plusScale = useRef(new Animated.Value(0.4)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }),
      ]),
      Animated.spring(plusScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(350),
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(taglineOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(logoScale, { toValue: 1.04, duration: 220, useNativeDriver: true }),
      ]),
    ]).start(() => onFinished());
  }, [logoOpacity, logoScale, plusScale, taglineOpacity, onFinished]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoBlock, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Text style={styles.logo}>PROGRESS<Text style={styles.plus}>+</Text></Text>
        <Animated.View style={{ transform: [{ scale: plusScale }] }}>
          <View style={styles.accentLine} />
        </Animated.View>
      </Animated.View>

      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>Chaque séance compte.</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  logoBlock: { alignItems: "center" },
  logo: { color: Colors.text, fontSize: 34, fontWeight: "900", letterSpacing: 1.5 },
  plus: { color: Colors.primary },
  accentLine: { width: 54, height: 4, marginTop: 12, borderRadius: 4, backgroundColor: Colors.primary },
  tagline: { position: "absolute", top: "57%", color: Colors.textSecondary, fontSize: 14, fontWeight: "600", letterSpacing: 0.4 },
});
