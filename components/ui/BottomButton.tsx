import {
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import Colors from "@/constants/colors";
import Button from "./Button";

interface BottomButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function BottomButton({
  title,
  onPress,
  disabled = false,
  style,
}: BottomButtonProps) {
  return (
    <View style={[styles.container, style]}>
      <Button
        title={title}
        onPress={onPress}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
container: {
  backgroundColor: Colors.background,

  paddingHorizontal: 20,
  paddingTop: 20,
  paddingBottom: 30,
},
});