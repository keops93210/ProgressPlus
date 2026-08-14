import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

import Design from "@/constants/design";

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
      <Text style={[styles.text, disabled && styles.disabledText]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: Design.control.buttonHeight,
    borderRadius: Design.radius.md,
    paddingHorizontal: Design.spacing.xl,
    backgroundColor: Design.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...Design.elevation.floating,
  },

  disabled: {
    backgroundColor: Design.colors.surfaceElevated,
    shadowOpacity: 0,
    elevation: 0,
  },

  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },

  text: {
    color: Design.colors.textOnPrimary,
    ...Design.typography.bodyStrong,
  },

  disabledText: {
    color: Design.colors.textMuted,
  },
});
