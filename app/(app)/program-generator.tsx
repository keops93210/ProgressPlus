import { router } from "expo-router";
import { Brain, ChevronLeft, Clock3, Dumbbell, Target, WandSparkles } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { createAdaptiveProgramPack, ProgramGoal, ProgramLevel } from "@/services/adaptive-program.service";

const goals: Array<{ value: ProgramGoal; label: string; description: string }> = [
  { value: "muscle", label: "Hypertrophie", description: "Construire du muscle et progresser régulièrement." },
  { value: "strength", label: "Force", description: "Prioriser la force sur les mouvements clés." },
  { value: "fat_loss", label: "Sèche", description: "Conserver le muscle avec un volume efficace." },
];
const levels: Array<{ value: ProgramLevel; label: string }> = [
  { value: "beginner", label: "Débutant" },
  { value: "intermediate", label: "Intermédiaire" },
  { value: "advanced", label: "Avancé" },
];
const days = [2, 3, 4, 5, 6] as const;
const durations = [45, 60, 75, 90] as const;

export default function ProgramGeneratorScreen() {
  const { user } = useAuth();
  const [goal, setGoal] = useState<ProgramGoal>("muscle");
  const [level, setLevel] = useState<ProgramLevel>("intermediate");
  const [daysPerWeek, setDaysPerWeek] = useState<(typeof days)[number]>(4);
  const [sessionMinutes, setSessionMinutes] = useState<(typeof durations)[number]>(75);
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!user) return;
    try {
      setLoading(true);
      const result = await createAdaptiveProgramPack({ userId: user.id, goal, level, daysPerWeek, sessionMinutes });
      Alert.alert("Programme créé", `${result.programs.length} séances ont été générées à partir de tes objectifs.`, [
        { text: "Voir mes programmes", onPress: () => router.replace("/(app)/workout") },
      ]);
    } catch (error: any) {
      Alert.alert("Impossible de générer", error?.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={10}><ChevronLeft size={26} color={Colors.text} /></Pressable>
        <View style={styles.headerCopy}><Text style={styles.title}>Coach programme</Text><Text style={styles.subtitle}>Un plan construit autour de toi.</Text></View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Card style={styles.hero}>
          <View style={styles.heroIcon}><WandSparkles size={24} color={Colors.primary} /></View>
          <Text style={styles.eyebrow}>PROGRESS+ ADAPTATIF</Text>
          <Text style={styles.heroTitle}>Ton programme, généré en quelques secondes.</Text>
          <Text style={styles.heroText}>Progress+ choisit une répartition cohérente, des exercices adaptés et une plage de travail selon ton objectif et ton niveau.</Text>
        </Card>

        <OptionSection icon={<Target size={18} color={Colors.primary} />} title="Objectif">
          <View style={styles.options}>{goals.map((item) => <Option key={item.value} active={goal === item.value} onPress={() => setGoal(item.value)} label={item.label} />)}</View>
          <Text style={styles.helper}>{goals.find((item) => item.value === goal)?.description}</Text>
        </OptionSection>

        <OptionSection icon={<Brain size={18} color={Colors.primary} />} title="Niveau">
          <View style={styles.options}>{levels.map((item) => <Option key={item.value} active={level === item.value} onPress={() => setLevel(item.value)} label={item.label} />)}</View>
        </OptionSection>

        <OptionSection icon={<Dumbbell size={18} color={Colors.primary} />} title="Jours par semaine">
          <View style={styles.options}>{days.map((value) => <Option key={value} active={daysPerWeek === value} onPress={() => setDaysPerWeek(value)} label={`${value} jours`} />)}</View>
        </OptionSection>

        <OptionSection icon={<Clock3 size={18} color={Colors.primary} />} title="Durée d'une séance">
          <View style={styles.options}>{durations.map((value) => <Option key={value} active={sessionMinutes === value} onPress={() => setSessionMinutes(value)} label={`${value} min`} />)}</View>
        </OptionSection>

        <View style={styles.summary}><Text style={styles.summaryTitle}>Aperçu</Text><Text style={styles.summaryText}>{daysPerWeek} séances · {sessionMinutes} min · {goals.find((item) => item.value === goal)?.label} · {levels.find((item) => item.value === level)?.label}</Text></View>
        <Button title={loading ? "GÉNÉRATION…" : "GÉNÉRER MON PROGRAMME"} onPress={generate} disabled={loading} />
        <Text style={styles.note}>Le moteur pourra ensuite ajuster les charges et le volume à partir de tes performances et de ta récupération.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function OptionSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <Card style={styles.card}><View style={styles.sectionHeader}>{icon}<Text style={styles.sectionTitle}>{title}</Text></View>{children}</Card>;
}
function Option({ active, onPress, label }: { active: boolean; onPress: () => void; label: string }) {
  return <Pressable onPress={onPress} style={[styles.option, active && styles.optionActive]}><Text style={[styles.optionText, active && styles.optionTextActive]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:Colors.background,padding:20},header:{flexDirection:"row",alignItems:"center",marginBottom:8},back:{width:44,height:44,borderRadius:22,backgroundColor:Colors.surfaceLight,alignItems:"center",justifyContent:"center",marginRight:8},headerCopy:{flex:1},title:{color:Colors.text,fontSize:28,fontWeight:"900"},subtitle:{color:Colors.textSecondary,fontSize:12,marginTop:3},content:{paddingTop:12,paddingBottom:35,gap:12},hero:{padding:18},heroIcon:{width:46,height:46,borderRadius:15,backgroundColor:Colors.primary+"18",alignItems:"center",justifyContent:"center",marginBottom:12},eyebrow:{color:Colors.primary,fontSize:10,fontWeight:"900",letterSpacing:1.2},heroTitle:{color:Colors.text,fontSize:23,lineHeight:28,fontWeight:"900",marginTop:6},heroText:{color:Colors.textSecondary,fontSize:13,lineHeight:20,marginTop:7},card:{padding:16},sectionHeader:{flexDirection:"row",alignItems:"center",gap:8,marginBottom:12},sectionTitle:{color:Colors.text,fontSize:16,fontWeight:"900"},options:{flexDirection:"row",flexWrap:"wrap",gap:8},option:{paddingHorizontal:13,paddingVertical:11,borderRadius:13,backgroundColor:Colors.background,borderWidth:1,borderColor:Colors.border},optionActive:{backgroundColor:Colors.primary,borderColor:Colors.primary},optionText:{color:Colors.textSecondary,fontSize:12,fontWeight:"800"},optionTextActive:{color:"#FFFFFF"},helper:{color:Colors.textSecondary,fontSize:11,lineHeight:16,marginTop:10},summary:{padding:16,borderRadius:16,backgroundColor:Colors.surfaceLight,borderWidth:1,borderColor:Colors.primary+"55"},summaryTitle:{color:Colors.primary,fontSize:10,fontWeight:"900",letterSpacing:1},summaryText:{color:Colors.text,fontSize:15,fontWeight:"800",marginTop:5},note:{color:Colors.textSecondary,fontSize:11,lineHeight:17,textAlign:"center",paddingHorizontal:10},
});
