import { StyleSheet, Text, TouchableOpacity } from "react-native";

import Colors from "@/constants/colors";

interface CounterButtonProps {
  label: string;
  onPress: () => void;
}

export default function CounterButton({
  label,
  onPress,
}: CounterButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
  },
});