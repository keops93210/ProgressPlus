import { StyleSheet, Text } from "react-native";

import Colors from "@/constants/colors";

interface RestTimerProps {
  seconds: number;
}

export default function RestTimer({
  seconds,
}: RestTimerProps) {
  const minutes = Math.floor(seconds / 60);

  const remaining = seconds % 60;

  return (
    <Text style={styles.timer}>
      ⏱ {minutes}:
      {remaining.toString().padStart(2, "0")}
    </Text>
  );
}

const styles = StyleSheet.create({
  timer: {
    color: Colors.primary,
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 20,
  },
});
