import { Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";

export type BodyTrendPeriod = 3 | 6 | 12;

type Props = {
  value: BodyTrendPeriod;
  onChange: (value: BodyTrendPeriod) => void;
};

const PERIODS: BodyTrendPeriod[] = [3, 6, 12];

export function BodyTrendPeriodSelector({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {PERIODS.map((period) => (
        <Pressable
          key={period}
          onPress={() => onChange(period)}
          style={[styles.item, value === period && styles.active]}
        >
          <Text style={[styles.text, value === period && styles.activeText]}>
            {period} mois
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  item: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  active: { backgroundColor: Colors.primarySoft, borderColor: Colors.primary },
  text: { color: Colors.textSecondary, fontSize: 10, fontWeight: "800" },
  activeText: { color: Colors.primaryLight },
});
