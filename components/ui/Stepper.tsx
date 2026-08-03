import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "@/constants/colors";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

export default function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
}: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => value > min && onChange(value - 1)}
      >
        <Text style={styles.symbol}>−</Text>
      </TouchableOpacity>

      <Text style={styles.value}>{value}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => value < max && onChange(value + 1)}
      >
        <Text style={styles.symbol}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },

  button: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  symbol: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },

  value: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: "700",
  },
});