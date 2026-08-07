import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import Card from "@/components/ui/Card";
import Colors from "@/constants/colors";

interface WorkoutRestCardProps {
  time: string;
  onAdd15: () => void;
  onRemove15: () => void;
  onSkip: () => void;
}

export default function WorkoutRestCard({
  time,
  onAdd15,
  onRemove15,
  onSkip,
}: WorkoutRestCardProps) {
  return (
    <Card>
      <Text style={styles.title}>
        ⏱️ Temps de repos
      </Text>

      <Text style={styles.timer}>
        {time}
      </Text>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.button}
          onPress={onRemove15}
        >
          <Text style={styles.buttonText}>
            -15 s
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={onAdd15}
        >
          <Text style={styles.buttonText}>
            +15 s
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={onSkip}
      >
        <Text style={styles.skipText}>
          Passer le repos
        </Text>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
  },

  timer: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: 52,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
  },

  buttons: {
    flexDirection: "row",
    gap: 10,
  },

  button: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  skipButton: {
    marginTop: 16,
    alignItems: "center",
  },

  skipText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
});