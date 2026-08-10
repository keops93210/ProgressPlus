import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Colors from "@/constants/colors";

const WARMUP_PRESETS = [40, 55, 70, 80, 90];
const STANDARD_PLATES = [1.25, 2.5, 5, 10, 15, 20];

function parseNumber(value: string) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function roundToAvailableWeight(weight: number) {
  return Math.max(0, Math.round(weight / 2.5) * 2.5);
}

export default function WorkoutTools() {
  const [target, setTarget] = useState("95");
  const [bar, setBar] = useState("20");
  const [selectedPlates, setSelectedPlates] = useState<number[]>(STANDARD_PLATES);

  const targetWeight = parseNumber(target);
  const barWeight = parseNumber(bar);

  const warmups = useMemo(
    () => WARMUP_PRESETS.map((percent, index) => ({ percent, weight: roundToAvailableWeight(targetWeight * percent / 100), reps: index < 2 ? 10 : index === 2 ? 6 : 3 })),
    [targetWeight]
  );

  const platePlan = useMemo(() => {
    const perSideTarget = Math.max(0, (targetWeight - barWeight) / 2);
    let remaining = perSideTarget;
    const plates: number[] = [];
    const sorted = [...selectedPlates].sort((a, b) => b - a);
    for (const plate of sorted) {
      while (remaining + 0.001 >= plate) {
        plates.push(plate);
        remaining -= plate;
      }
    }
    return { plates, remaining: Math.round(remaining * 100) / 100, perSideTarget };
  }, [targetWeight, barWeight, selectedPlates]);

  function togglePlate(plate: number) {
    setSelectedPlates((current) => current.includes(plate) ? current.filter((item) => item !== plate) : [...current, plate]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={10}>
          <ChevronLeft size={26} color={Colors.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Outils musculation</Text>
          <Text style={styles.subtitle}>Les outils utiles inspirés des meilleurs trackers.</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Card style={styles.hero}>
          <Text style={styles.eyebrow}>PROGRESS+</Text>
          <Text style={styles.heroTitle}>Moins de calculs. Plus de séries.</Text>
          <Text style={styles.heroText}>Hevy facilite le logging, Strong excelle sur le timer et Fitbod pousse l'adaptation. Progress+ réunit ces principes sans te faire sortir de ta séance.</Text>
        </Card>

        <Text style={styles.sectionTitle}>Échauffement intelligent</Text>
        <Card style={styles.card}>
          <Text style={styles.label}>CHARGE DE TRAVAIL</Text>
          <View style={styles.inputRow}>
            <TextInput value={target} onChangeText={setTarget} keyboardType="decimal-pad" style={styles.input} />
            <Text style={styles.unit}>kg</Text>
          </View>
          <Text style={styles.helper}>Progress+ propose des paliers rapides avant ta charge de travail.</Text>
          <View style={styles.warmupGrid}>
            {warmups.map((item) => (
              <View key={item.percent} style={styles.warmupItem}>
                <Text style={styles.percent}>{item.percent}%</Text>
                <Text style={styles.warmupWeight}>{item.weight} kg</Text>
                <Text style={styles.reps}>{item.reps} reps</Text>
              </View>
            ))}
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Calculateur de disques</Text>
        <Card style={styles.card}>
          <View style={styles.twoInputs}>
            <View style={styles.flexInput}>
              <Text style={styles.label}>OBJECTIF</Text>
              <TextInput value={target} onChangeText={setTarget} keyboardType="decimal-pad" style={styles.input} />
            </View>
            <View style={styles.flexInput}>
              <Text style={styles.label}>BARRE</Text>
              <TextInput value={bar} onChangeText={setBar} keyboardType="decimal-pad" style={styles.input} />
            </View>
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>DISQUES DISPONIBLES PAR CÔTÉ</Text>
          <View style={styles.plateSelector}>
            {STANDARD_PLATES.map((plate) => {
              const active = selectedPlates.includes(plate);
              return (
                <Pressable key={plate} onPress={() => togglePlate(plate)} style={[styles.plate, active && styles.plateActive]}>
                  <Text style={[styles.plateText, active && styles.plateTextActive]}>{plate}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.result}>
            <Text style={styles.resultEyebrow}>PAR CÔTÉ</Text>
            <Text style={styles.resultTitle}>{platePlan.plates.length ? platePlan.plates.map((plate) => `${plate} kg`).join(" + ") : "Barre seule"}</Text>
            <Text style={styles.resultMeta}>{platePlan.remaining === 0 ? "Charge exacte" : `Il manque ${platePlan.remaining} kg par côté`}</Text>
          </View>
        </Card>

        <Card style={styles.note}>
          <Text style={styles.noteTitle}>Notre direction</Text>
          <Text style={styles.noteText}>Le prochain gros chantier sera le RPE/RIR, les supersets et la récupération musculaire par groupe : c'est là que Progress+ peut dépasser un simple carnet d'entraînement.</Text>
        </Card>

        <Button title="RETOUR AUX PROGRAMMES" onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceLight, alignItems: "center", justifyContent: "center", marginRight: 8 },
  headerCopy: { flex: 1 },
  title: { color: Colors.text, fontSize: 28, fontWeight: "900" },
  subtitle: { color: Colors.textSecondary, fontSize: 12, marginTop: 3 },
  content: { paddingTop: 12, paddingBottom: 30, gap: 12 },
  hero: { padding: 18 },
  eyebrow: { color: Colors.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  heroTitle: { color: Colors.text, fontSize: 23, lineHeight: 28, fontWeight: "900", marginTop: 6 },
  heroText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 7 },
  sectionTitle: { color: Colors.text, fontSize: 20, fontWeight: "900", marginTop: 10 },
  card: { padding: 18 },
  label: { color: Colors.textSecondary, fontSize: 10, fontWeight: "900", letterSpacing: 0.9 },
  inputRow: { flexDirection: "row", alignItems: "center", marginTop: 7 },
  input: { height: 48, flex: 1, borderRadius: 13, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, color: Colors.text, paddingHorizontal: 14, fontSize: 18, fontWeight: "800" },
  unit: { color: Colors.textSecondary, fontSize: 14, fontWeight: "800", marginLeft: 8 },
  helper: { color: Colors.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 8 },
  warmupGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  warmupItem: { width: "31%", padding: 10, borderRadius: 13, backgroundColor: Colors.surfaceLight, borderWidth: 1, borderColor: Colors.border },
  percent: { color: Colors.primary, fontSize: 10, fontWeight: "900" },
  warmupWeight: { color: Colors.text, fontSize: 15, fontWeight: "900", marginTop: 4 },
  reps: { color: Colors.textSecondary, fontSize: 10, marginTop: 2 },
  twoInputs: { flexDirection: "row", gap: 10 },
  flexInput: { flex: 1 },
  plateSelector: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  plate: { minWidth: 54, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 12, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, alignItems: "center" },
  plateActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  plateText: { color: Colors.text, fontWeight: "800", fontSize: 12 },
  plateTextActive: { color: "#FFFFFF" },
  result: { marginTop: 16, padding: 15, borderRadius: 15, backgroundColor: Colors.surfaceLight, borderWidth: 1, borderColor: Colors.primary },
  resultEyebrow: { color: Colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  resultTitle: { color: Colors.text, fontSize: 18, fontWeight: "900", marginTop: 5 },
  resultMeta: { color: Colors.textSecondary, fontSize: 11, marginTop: 4 },
  note: { padding: 16 },
  noteTitle: { color: Colors.text, fontSize: 15, fontWeight: "900" },
  noteText: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 5 },
});