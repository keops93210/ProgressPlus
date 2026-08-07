import Card from "@/components/ui/Card";
import Colors from "@/constants/colors";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface WorkoutWeightCardProps {
  weight: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

export default function WorkoutWeightCard({
  weight,
  onIncrease,
  onDecrease,
}: WorkoutWeightCardProps) {
  return (
    <Card>
      <Text style={styles.title}>Poids</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.button}
          onPress={onDecrease}
        >
          <Text style={styles.buttonText}>−</Text>
        </TouchableOpacity>

        <Text style={styles.weight}>
          {weight} kg
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={onIncrease}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 18,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  button: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    fontSize: 30,
    fontWeight: "800",
    color: "#fff",
  },

  weight: {
    flex: 1,
    textAlign: "center",
    fontSize: 34,
    fontWeight: "800",
    color: Colors.text,
  },
});