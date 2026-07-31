import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

import Colors from "@/constants/colors";
import Radius from "@/constants/radius";

interface ButtonProps {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export default function Button({
  title,
  onPress,
  style,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        style,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 58,
    borderRadius: Radius.lg,

    backgroundColor: Colors.primary,

    justifyContent: "center",
    alignItems: "center",

    shadowColor: Colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 0,
    },

    elevation: 10,
  },

  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  text: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: "700",
  },
});