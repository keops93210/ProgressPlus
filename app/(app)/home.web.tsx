import { View, StyleSheet } from "react-native";
import HomeV02Final from "./home-v02-final";

// Web shell: keep the dashboard centered and prevent desktop layouts from
// overflowing past the viewport. The bottom Expo Router tab bar remains full width.
export default function HomeWeb() {
  return (
    <View style={styles.page}>
      <View style={styles.content}>
        <HomeV02Final />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#08080B",
  },
  content: {
    width: "100%",
    maxWidth: 1600,
    flex: 1,
    overflow: "hidden",
  },
});
