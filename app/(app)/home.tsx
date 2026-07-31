import { Calendar, Dumbbell, Flame, Trophy } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Colors from "@/constants/colors";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.greeting}>Bonjour Andy 👋</Text>
      <Text style={styles.subtitle}>Prêt pour battre ton prochain record ?</Text>

      <Card>
        <View style={styles.row}>
          <Dumbbell color={Colors.primary} size={24} />
          <Text style={styles.cardTitle}>Séance du jour</Text>
        </View>

        <Text style={styles.workout}>PUSH</Text>

        <Button title="COMMENCER LA SÉANCE" />
      </Card>

      <Card>
        <View style={styles.row}>
          <Flame color={Colors.primary} size={22} />
          <Text style={styles.cardTitle}>Cette semaine</Text>
        </View>

        <Text style={styles.stat}>🔥 4 séances</Text>
        <Text style={styles.stat}>⏱️ 5 h 32</Text>
        <Text style={styles.stat}>🏋️ 52 340 kg</Text>
      </Card>

      <Card>
        <View style={styles.row}>
          <Trophy color={Colors.primary} size={22} />
          <Text style={styles.cardTitle}>Dernier record</Text>
        </View>

        <Text style={styles.record}>
          Développé couché{"\n"}
          <Text style={styles.recordValue}>95 kg × 5</Text>
        </Text>
      </Card>

      <Card>
        <View style={styles.row}>
          <Calendar color={Colors.primary} size={22} />
          <Text style={styles.cardTitle}>Prochaine séance</Text>
        </View>

        <Text style={styles.record}>Demain • PULL</Text>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    gap: 18,
  },

  greeting: {
    color: Colors.text,
    fontSize: 30,
    fontWeight: "800",
    marginTop: 10,
  },

  subtitle: {
    color: Colors.textSecondary,
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  cardTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
  },

  workout: {
    color: Colors.primary,
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 20,
  },

  stat: {
    color: Colors.text,
    fontSize: 16,
    marginBottom: 8,
  },

  record: {
    color: Colors.text,
    fontSize: 16,
  },

  recordValue: {
    color: Colors.primary,
    fontWeight: "800",
    fontSize: 24,
  },
});