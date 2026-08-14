import { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import Design from "@/constants/design";

interface HeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

export default function Header({ title, subtitle, right }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.eyebrow}>PROGRESS+</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Design.spacing.section,
  },
  left: {
    flex: 1,
    paddingRight: Design.spacing.md,
  },
  eyebrow: {
    color: Design.colors.primaryLight,
    ...Design.typography.eyebrow,
    marginBottom: Design.spacing.sm,
  },
  title: {
    color: Design.colors.text,
    ...Design.typography.h1,
  },
  subtitle: {
    marginTop: Design.spacing.sm,
    color: Design.colors.textSecondary,
    ...Design.typography.body,
  },
  right: {
    minHeight: Design.control.iconButton,
    justifyContent: "center",
    alignItems: "center",
  },
});
