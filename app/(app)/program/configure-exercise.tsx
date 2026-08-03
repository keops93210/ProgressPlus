import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BottomButton from "@/components/ui/BottomButton";
import Card from "@/components/ui/Card";
import Header from "@/components/ui/Header";
import Stepper from "@/components/ui/Stepper";
import Colors from "@/constants/colors";
import { addExerciseToProgram } from "@/services/program.service";

export default function ConfigureExerciseScreen() {
  const {
    id,
    name,
    exerciseId,
  } = useLocalSearchParams<{
    id: string;
    name: string;
    exerciseId: string;
  }>();

  const [sets, setSets] = useState(3);
  const [minReps, setMinReps] = useState(8);
  const [maxReps, setMaxReps] = useState(10);
  const [rest, setRest] = useState(90);

  async function handleAddExercise() {
    try {
      if (!id || !exerciseId) {
        Alert.alert(
          "Erreur",
          "Programme ou exercice introuvable."
        );
        return;
      }

      await addExerciseToProgram(
        String(id),
        String(exerciseId),
        sets,
        minReps,
        maxReps,
        rest
      );

      router.back();
      router.back();
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={name ?? "Exercice"}
        subtitle="Configuration"
      />

      <Card>
        <Text style={styles.label}>Séries</Text>

        <Stepper
          value={sets}
          onChange={setSets}
          min={1}
          max={10}
        />

        <Text style={styles.label}>
          Répétitions minimum
        </Text>

        <Stepper
          value={minReps}
          onChange={setMinReps}
          min={1}
          max={30}
        />

        <Text style={styles.label}>
          Répétitions maximum
        </Text>

        <Stepper
          value={maxReps}
          onChange={setMaxReps}
          min={1}
          max={30}
        />

        <Text style={styles.label}>
          Repos (secondes)
        </Text>

        <Stepper
          value={rest}
          onChange={setRest}
          min={30}
          max={300}
        />
      </Card>

      <BottomButton
        title="AJOUTER"
        onPress={handleAddExercise}
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

  label: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 16,
  },
});