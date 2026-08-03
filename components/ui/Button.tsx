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
  disabled?: boolean;
  style?: ViewStyle;
}

export default function Button({
  title,
  onPress,
  disabled = false,
  style,
}: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        style,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.text,
          disabled && styles.disabledText,
        ]}
      >
        {title}
      </Text>
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

  disabled: {
    backgroundColor: "#3A3A3A",
    shadowOpacity: 0,
    elevation: 0,
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

  disabledText: {
    color: "#888888",
  },
});