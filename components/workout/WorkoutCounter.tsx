import { StyleSheet, Text } from "react-native";

import Colors from "@/constants/colors";

interface WorkoutCounterProps {
  current: number;
  total: number;
}

export default function WorkoutCounter({
  current,
  total,
}: WorkoutCounterProps) {
  return (
    <Text style={styles.text}>
      Exercice {current} / {total}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 15,
  },
});
