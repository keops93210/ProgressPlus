import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import Design from "@/constants/design";

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Design.colors.surface,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Design.colors.border,
    padding: Design.spacing.xl,
    ...Design.elevation.card,
  },
});
