import { Pressable } from "react-native";
import * as Haptics from "expo-haptics";

export function HapticTab(
  props: React.ComponentProps<typeof Pressable>
) {
  return (
    <Pressable
      {...props}
      onPressIn={(event) => {
        if (process.env.EXPO_OS === "ios") {
          void Haptics.impactAsync(
            Haptics.ImpactFeedbackStyle.Light
          );
        }

        props.onPressIn?.(event);
      }}
    />
  );
}
