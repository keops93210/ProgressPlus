import { StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";

export default function Header() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>P+</Text>

      <Text style={styles.title}>
        Progress+
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,

    flexDirection: "row",

    alignItems: "center",
  },

  logo: {
    color: Colors.primary,

    fontSize: 24,

    fontWeight: "900",

    marginRight: 12,
  },

  title: {
    color: Colors.text,

    fontSize: 22,

    fontWeight: "800",
  },
});