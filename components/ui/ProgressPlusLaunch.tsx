import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";

interface ProgressPlusLaunchProps {
  onFinished: () => void;
}

export default function ProgressPlusLaunch({ onFinished }: ProgressPlusLaunchProps) {
  const markOpacity = useRef(new Animated.Value(0)).current;
  const markScale = useRef(new Animated.Value(0.72)).current;
  const markY = useRef(new Animated.Value(12)).current;
  const ringProgress = useRef(new Animated.Value(0)).current;
  const wordOpacity = useRef(new Animated.Value(0)).current;
  const wordY = useRef(new Animated.Value(10)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(markOpacity, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(markScale, {
          toValue: 1,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(markY, {
          toValue: 0,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(ringProgress, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.parallel([
        Animated.timing(wordOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(wordY, {
          toValue: 0,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.delay(520),
      Animated.parallel([
        Animated.timing(exitOpacity, {
          toValue: 0,
          duration: 260,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(exitScale, {
          toValue: 1.025,
          duration: 260,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      if (finished) onFinished();
    });
  }, [markOpacity, markScale, markY, ringProgress, wordOpacity, wordY, taglineOpacity, exitOpacity, exitScale, onFinished]);

  const progressWidth = ringProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View style={[styles.container, { opacity: exitOpacity, transform: [{ scale: exitScale }] }]}>
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.mark,
            {
              opacity: markOpacity,
              transform: [{ translateY: markY }, { scale: markScale }],
            },
          ]}
        >
          <View style={styles.markInner}>
            <Text style={styles.markP}>P</Text>
            <View style={styles.markPlusVertical} />
            <View style={styles.markPlusHorizontal} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.brand, { opacity: wordOpacity, transform: [{ translateY: wordY }] }]}>
          <Text style={styles.brandText}>PROGRESS<Text style={styles.brandPlus}>+</Text></Text>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
        </Animated.View>

        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Chaque séance compte.
        </Animated.Text>
      </View>
    </Animated.View>
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
  center: {
    width: "100%",
    alignItems: "center",
  },
  mark: {
    width: 82,
    height: 82,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  markInner: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  markP: {
    color: Colors.text,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "900",
    letterSpacing: -4,
    marginRight: 7,
  },
  markPlusVertical: {
    position: "absolute",
    right: 0,
    top: 16,
    width: 5,
    height: 22,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  markPlusHorizontal: {
    position: "absolute",
    right: -8,
    top: 24,
    width: 21,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  brand: {
    marginTop: 22,
    alignItems: "center",
  },
  brandText: {
    color: Colors.text,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 2.2,
  },
  brandPlus: {
    color: Colors.primary,
  },
  progressTrack: {
    width: 118,
    height: 3,
    marginTop: 13,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: Colors.surfaceLight,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  tagline: {
    marginTop: 18,
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.7,
  },
});
