import { StyleSheet, Text, View } from "react-native";
import CounterButton from "./CounterButton";

import Colors from "@/constants/colors";

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
      <Text style={styles.title}>
        {title}
      </Text>

      <View style={styles.row}>
<CounterButton
  label="+"
  onPress={onIncrease}
/>

        <Text style={styles.value}>
          {value}
          {suffix ? ` ${suffix}` : ""}
        </Text>

<CounterButton
  label="−"
  onPress={onDecrease}
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
  value: {
    flex: 1,
    textAlign: "center",
    fontSize: 34,
    fontWeight: "800",
    color: Colors.text,
  },
});