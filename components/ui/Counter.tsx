import Colors from "@/constants/colors";
import { StyleSheet, Text, View } from "react-native";
import AnimatedNumber from "./AnimatedNumber";
import CounterButton from "./CounterButton";

interface CounterProps {
  title: string;
  value: number;
  suffix?: string;
  onIncrease: () => void;
  onDecrease: () => void;
}

export default function Counter({
  title,
  value,
  suffix,
  onIncrease,
  onDecrease,
}: CounterProps) {
  return (
    <>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.row}>
        <CounterButton
          label="−"
          onPress={onDecrease}
        />

        <AnimatedNumber
          value={value}
          suffix={suffix}
        />

        <CounterButton
          label="+"
          onPress={onIncrease}
        />
      </View>
    </>
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
    alignItems: "center",
    justifyContent: "space-between",
  },
});