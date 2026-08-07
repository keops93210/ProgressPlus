import { StyleSheet, Text } from "react-native";

import Card from "@/components/ui/Card";
import Colors from "@/constants/colors";

interface WorkoutRestCardProps {
  time: string;
}

export default function WorkoutRestCard({
  time,
}: WorkoutRestCardProps) {
  return (
    <Card>
      <Text style={styles.title}>
        ⏱️ Temps de repos
      </Text>

      <Text style={styles.timer}>
        {time}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
  },

  timer: {
    marginTop: 20,
    fontSize: 52,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
  },
});