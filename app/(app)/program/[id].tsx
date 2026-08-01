import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Colors from "@/constants/colors";
import { getProgram } from "@/services/program.service";
import { WorkoutProgram } from "@/types/program";

export default function ProgramScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [program, setProgram] = useState<WorkoutProgram | null>(null);

  useEffect(() => {
    loadProgram();
  }, []);

  async function loadProgram() {
    if (!id) return;

    try {
      const data = await getProgram(id);
      setProgram(data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        {program?.name ?? "Programme"}
      </Text>

      <Card>
        <Text style={styles.label}>Nom</Text>

        <Text style={styles.value}>
          {program?.name}
        </Text>
      </Card>

      <Card>
        <Text style={styles.label}>Description</Text>

        <Text style={styles.value}>
          {program?.description ?? "Aucune description"}
        </Text>
      </Card>

      <Button
        title="AJOUTER UN EXERCICE"
        onPress={() => {}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },

  title: {
    color: Colors.text,
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 25,
  },

  label: {
    color: Colors.textSecondary,
    marginBottom: 8,
    fontSize: 14,
  },

  value: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
});