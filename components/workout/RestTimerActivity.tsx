import { Text, VStack } from "@expo/ui/swift-ui";
import {
  font,
  foregroundStyle,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import {
  createLiveActivity,
  type LiveActivityEnvironment,
} from "expo-widgets";

type RestTimerActivityProps = {
  endAt: number;
  duration: number;
};

const RestTimerActivity = (
  props: RestTimerActivityProps,
  environment: LiveActivityEnvironment
) => {
  "widget";

  const startAt = new Date(props.endAt - props.duration * 1000);
  const endAt = new Date(props.endAt);

  const timer = (
    <Text
      timerInterval={{ lower: startAt, upper: endAt }}
      countsDown
      modifiers={[
        font({ weight: "bold", size: 34 }),
        foregroundStyle("#FFFFFF"),
      ]}
    />
  );

  const compactTimer = (
    <Text
      timerInterval={{ lower: startAt, upper: endAt }}
      countsDown
      modifiers={[font({ weight: "bold", size: 13 })]}
    />
  );

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
        {timer}
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
    compactTrailing: compactTimer,
    minimal: compactTimer,
    expandedLeading: (
      <Text modifiers={[font({ weight: "bold", size: 14 })]}>Repos</Text>
    ),
    expandedTrailing: (
      <Text
        timerInterval={{ lower: startAt, upper: endAt }}
        countsDown
        modifiers={[font({ weight: "bold", size: 26 })]}
      />
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
