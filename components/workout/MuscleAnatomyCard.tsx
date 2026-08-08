import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";

import Colors from "@/constants/colors";

function isChest(muscle: string) {
  return /chest|pec|pector/i.test(muscle);
}
function isBack(muscle: string) {
  return /back|lat|trap|dors/i.test(muscle);
}
function isShoulder(muscle: string) {
  return /shoulder|deltoid|épaule/i.test(muscle);
}
function isArm(muscle: string) {
  return /bicep|tricep|arm|bras/i.test(muscle);
}
function isLeg(muscle: string) {
  return /quad|hamstring|glute|calf|leg|jambe|fess/i.test(muscle);
}

export default function MuscleAnatomyCard({ muscle }: { muscle: string }) {
  const chest = isChest(muscle);
  const back = isBack(muscle);
  const shoulder = isShoulder(muscle);
  const arm = isArm(muscle);
  const leg = isLeg(muscle);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Zone travaillée</Text>
      <Text style={styles.subtitle}>Vue anatomique • muscle principal</Text>

      <View style={styles.figures}>
        <View style={styles.figureWrap}>
          <Text style={styles.figureLabel}>AVANT</Text>
          <Svg width={150} height={300} viewBox="0 0 150 300">
            <Circle cx="75" cy="27" r="18" fill="#E7E2EF" />
            <Rect x="66" y="45" width="18" height="28" rx="8" fill="#E7E2EF" />
            <Ellipse cx="48" cy="82" rx="12" ry="18" fill={shoulder || chest ? Colors.primaryLight : "#E0DAE9"} />
            <Ellipse cx="102" cy="82" rx="12" ry="18" fill={shoulder || chest ? Colors.primaryLight : "#E0DAE9"} />
            <Path d="M60 62 C48 65 42 78 45 105 L55 130 L63 112 L75 116 L87 112 L95 130 L105 105 C108 78 102 65 90 62 Z" fill={chest ? Colors.primary : "#DDD7E6"} />
            <Path d="M61 67 C68 72 82 72 89 67 L86 108 C80 113 70 113 64 108 Z" fill={chest ? Colors.primary : "#D5CEDF"} opacity={chest ? 0.95 : 1} />
            <Path d="M46 101 L55 130 L53 172 L43 172 L38 127 Z" fill={arm ? Colors.primary : "#DDD7E6"} />
            <Path d="M104 101 L95 130 L97 172 L107 172 L112 127 Z" fill={arm ? Colors.primary : "#DDD7E6"} />
            <Path d="M58 125 L73 130 L70 190 L58 190 Z" fill={leg ? Colors.primary : "#D9D2E3"} />
            <Path d="M77 130 L92 125 L92 190 L80 190 Z" fill={leg ? Colors.primary : "#D9D2E3"} />
            <Path d="M58 188 L70 188 L66 270 L53 270 Z" fill={leg ? Colors.primary : "#E0DAE9"} />
            <Path d="M80 188 L92 188 L97 270 L84 270 Z" fill={leg ? Colors.primary : "#E0DAE9"} />
            <Path d="M42 126 C54 116 62 116 75 121 C88 116 96 116 108 126" fill="none" stroke="#BDB3CE" strokeWidth="2" opacity="0.7" />
          </Svg>
        </View>

        <View style={styles.figureWrap}>
          <Text style={styles.figureLabel}>ARRIÈRE</Text>
          <Svg width={150} height={300} viewBox="0 0 150 300">
            <Circle cx="75" cy="27" r="18" fill="#E7E2EF" />
            <Rect x="66" y="45" width="18" height="28" rx="8" fill="#E7E2EF" />
            <Path d="M58 63 L75 72 L92 63 C104 70 108 89 102 112 L92 130 L75 119 L58 130 L48 112 C42 89 46 70 58 63 Z" fill={back ? Colors.primary : "#DDD7E6"} />
            <Ellipse cx="48" cy="82" rx="12" ry="18" fill={shoulder ? Colors.primaryLight : "#E0DAE9"} />
            <Ellipse cx="102" cy="82" rx="12" ry="18" fill={shoulder ? Colors.primaryLight : "#E0DAE9"} />
            <Path d="M46 101 L55 130 L53 172 L43 172 L38 127 Z" fill={arm ? Colors.primary : "#DDD7E6"} />
            <Path d="M104 101 L95 130 L97 172 L107 172 L112 127 Z" fill={arm ? Colors.primary : "#DDD7E6"} />
            <Path d="M58 125 L73 130 L70 190 L58 190 Z" fill={leg ? Colors.primary : "#D9D2E3"} />
            <Path d="M77 130 L92 125 L92 190 L80 190 Z" fill={leg ? Colors.primary : "#D9D2E3"} />
            <Path d="M58 188 L70 188 L66 270 L53 270 Z" fill={leg ? Colors.primary : "#E0DAE9"} />
            <Path d="M80 188 L92 188 L97 270 L84 270 Z" fill={leg ? Colors.primary : "#E0DAE9"} />
          </Svg>
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.dot} />
        <Text style={styles.legendText}>Muscle principal : {muscle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#FFFFFF", borderRadius: 24, borderWidth: 1, borderColor: Colors.border, padding: 20, marginBottom: 16 },
  title: { color: Colors.text, fontSize: 26, fontWeight: "900" },
  subtitle: { color: Colors.textSecondary, fontSize: 15, fontWeight: "600", marginTop: 4 },
  figures: { flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 14 },
  figureWrap: { alignItems: "center", flex: 1 },
  figureLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: "900", letterSpacing: 1.4, marginBottom: 2 },
  legend: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: Colors.surfaceLight, borderRadius: 16, padding: 14, marginTop: 6 },
  dot: { width: 11, height: 11, borderRadius: 6, backgroundColor: Colors.primary },
  legendText: { color: Colors.primaryDark, fontSize: 15, fontWeight: "800", flex: 1 },
});
