import { Text, VStack } from "@expo/ui/swift-ui";
import { font, foregroundStyle, padding } from "@expo/ui/swift-ui/modifiers";
import {
  createLiveActivity,
  type LiveActivityEnvironment,
} from "expo-widgets";

type RestTimerActivityProps = {
  remaining: number;
  duration: number;
};

const RestTimerActivity = (
  props: RestTimerActivityProps,
  environment: LiveActivityEnvironment
) => {
  "widget";

  const minutes = Math.floor(props.remaining / 60);
  const seconds = props.remaining % 60;
  const time = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return {
    banner: (
      <VStack modifiers={[padding({ all: 16 })]}>
        <Text
          modifiers={[
            font({ weight: "bold", size: 12 }),
            foregroundStyle("#999999"),
          ]}
        >
          PROGRESS+
        </Text>
        <Text
          modifiers={[
            font({ weight: "bold", size: 34 }),
            foregroundStyle("#FFFFFF"),
          ]}
        >
          {time}
        </Text>
        <Text
          modifiers={[font({ size: 13 }), foregroundStyle("#BBBBBB")]}
        >
          Temps de repos
        </Text>
      </VStack>
    ),
    compactLeading: (
      <Text modifiers={[font({ weight: "bold", size: 12 })]}>⏱</Text>
    ),
    compactTrailing: (
      <Text modifiers={[font({ weight: "bold", size: 13 })]}>{time}</Text>
    ),
    minimal: (
      <Text modifiers={[font({ weight: "bold", size: 12 })]}>{time}</Text>
    ),
    expandedLeading: (
      <Text modifiers={[font({ weight: "bold", size: 14 })]}>Repos</Text>
    ),
    expandedTrailing: (
      <Text modifiers={[font({ weight: "bold", size: 26 })]}>{time}</Text>
    ),
    expandedBottom: (
      <Text modifiers={[font({ size: 12 })]}>Prochaine série</Text>
    ),
  };
};

export default createLiveActivity(
  "ProgressPlusRestTimer",
  RestTimerActivity
);
