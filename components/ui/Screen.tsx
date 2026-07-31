import React, { ReactNode } from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";

import Colors from "@/constants/colors";

interface ScreenProps {
  children: ReactNode;
}

export default function Screen({
  children,
}: ScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.background}
      />
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});