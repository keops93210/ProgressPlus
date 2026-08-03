import { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import Colors from "@/constants/colors";

interface HeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

export default function Header({
  title,
  subtitle,
  right,
}: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>
          {title}
        </Text>

        {subtitle ? (
          <Text style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {right ? (
        <View>
          {right}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: 24,
  },

  left: {
    flex: 1,
  },

  title: {
    color: Colors.text,
    fontSize: 34,
    fontWeight: "800",
  },

  subtitle: {
    marginTop: 6,

    color: Colors.textSecondary,
    fontSize: 15,
  },
});