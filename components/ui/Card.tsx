import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import Colors from "@/constants/colors";
import Radius from "@/constants/radius";

interface CardProps {
  children: ReactNode;
}

export default function Card({
  children,
}: CardProps) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,

    borderRadius: Radius.lg,

    borderWidth: 1,

    borderColor: Colors.border,

    padding: 20,
  },
});