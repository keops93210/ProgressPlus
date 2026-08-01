import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Introuvable" }} />

      <View style={styles.container}>
        <Text style={styles.title}>404</Text>

        <Text style={styles.text}>
          Cette page n'existe pas.
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 48,
    fontWeight: "700",
    marginBottom: 16,
  },

  text: {
    fontSize: 18,
  },
});