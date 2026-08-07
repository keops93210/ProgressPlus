import { StyleSheet, Text } from "react-native";

import Colors from "@/constants/colors";

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
}

export default function AnimatedNumber({
  value,
  suffix,
}: AnimatedNumberProps) {
  return (
    <Text style={styles.value}>
      {value}
      {suffix ? ` ${suffix}` : ""}
    </Text>
  );
}

const styles = StyleSheet.create({
  value: {
    flex: 1,
    textAlign: "center",
    fontSize: 34,
    fontWeight: "800",
    color: Colors.text,
  },
});