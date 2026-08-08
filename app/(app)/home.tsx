import { router } from "expo-router";
import { Activity, CalendarDays, ChevronRight, Flame, Moon, Smile, Sparkles, Trophy, Zap } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

function Metric({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Icon color={Colors.primary} size={18} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>PROGRESS+</Text>
            <Text style={styles.greeting}>Bonjour Andy 👋</Text>
            <Text style={styles.subtitle}>Prêt à progresser aujourd'hui ?</Text>
          </View>
          <TouchableOpacity style={styles.avatar} onPress={() => router.push("/(app)/profile")}>
            <Text style={styles.avatarText}>A</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.levelCard}>
          <View style={styles.levelTop}>
            <View>
              <Text style={styles.levelLabel}>NIVEAU 12</Text>
              <Text style={styles.levelTitle}>ATHLÈTE</Text>
            </View>
            <View style={styles.xpPill}><Sparkles color={Colors.primary} size={15} /><Text style={styles.xpText}>1 240 XP</Text></View>
          </View>
          <View style={styles.progressTrack}><View style={styles.progressFill} /></View>
          <View style={styles.levelBottom}><Text style={styles.levelSmall}>760 XP avant le niveau 13</Text><Text style={styles.levelSmall}>62%</Text></View>
        </View>

        <SectionHeader title="Ta séance aujourd'hui" />
        <TouchableOpacity style={styles.workoutCard} activeOpacity={0.9} onPress={() => router.push("/(app)/workout")}>
          <View style={styles.workoutIcon}><Activity color={Colors.primary} size={28} /></View>
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutType}>PUSH</Text>
            <Text style={styles.workoutName}>Pectoraux • Épaules • Triceps</Text>
            <Text style={styles.workoutMeta}>5 exercices • ~60 min</Text>
          </View>
          <View style={styles.startCircle}><ChevronRight color={Colors.background} size={24} /></View>
        </TouchableOpacity>

        <SectionHeader title="Ton état aujourd'hui" />
        <View style={styles.recoveryCard}>
          <Metric icon={Moon} label="Sommeil" value="8/10" />
          <View style={styles.divider} />
          <Metric icon={Zap} label="Énergie" value="9/10" />
          <View style={styles.divider} />
          <Metric icon={Smile} label="Humeur" value="8/10" />
        </View>
        <TouchableOpacity style={styles.checkinButton} onPress={() => router.push("/(app)/workout")}> 
          <Text style={styles.checkinText}>Modifier mon état</Text>
          <ChevronRight color={Colors.primary} size={18} />
        </TouchableOpacity>

        <View style={styles.twoColumns}>
          <View style={styles.statCard}>
            <Flame color={Colors.primary} size={21} />
            <Text style={styles.statBig}>12</Text>
            <Text style={styles.statLabel}>séances d'affilée</Text>
          </View>
          <TouchableOpacity style={styles.statCard} onPress={() => router.push("/(app)/ranking")}>
            <Trophy color={Colors.primary} size={21} />
            <Text style={styles.statBig}>#127</Text>
            <Text style={styles.statLabel}>classement global</Text>
          </TouchableOpacity>
        </View>

        <SectionHeader title="Progression" action="Voir les stats" />
        <TouchableOpacity style={styles.progressCard} onPress={() => router.push("/(app)/progress")}>
          <View style={styles.progressTitleRow}>
            <View><Text style={styles.progressBig}>+7,4%</Text><Text style={styles.progressLabel}>volume ce mois-ci</Text></View>
            <View style={styles.trendBadge}><Text style={styles.trendText}>↗ EN HAUSSE</Text></View>
          </View>
          <View style={styles.fakeChart}>
            {[28, 42, 36, 54, 48, 67, 76, 88].map((height, index) => <View key={index} style={[styles.chartBar, { height }]} />)}
          </View>
        </TouchableOpacity>

        <SectionHeader title="Dernier record" />
        <View style={styles.recordCard}>
          <View><Text style={styles.recordExercise}>Développé couché</Text><Text style={styles.recordDate}>Nouveau record personnel</Text></View>
          <Text style={styles.recordValue}>95 × 5</Text>
        </View>

        <View style={styles.nextCard}>
          <CalendarDays color={Colors.primary} size={22} />
          <View style={{ flex: 1 }}><Text style={styles.nextLabel}>PROCHAINE SÉANCE</Text><Text style={styles.nextValue}>Demain • PULL</Text></View>
          <ChevronRight color={Colors.textSecondary} size={20} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 20, paddingBottom: 110, gap: 14 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  eyebrow: { color: Colors.primary, fontSize: 11, fontWeight: "900", letterSpacing: 2 },
  greeting: { color: Colors.text, fontSize: 28, fontWeight: "900", marginTop: 3 },
  subtitle: { color: Colors.textSecondary, fontSize: 14, marginTop: 3 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  avatarText: { color: Colors.primary, fontSize: 20, fontWeight: "900" },
  levelCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: Colors.border },
  levelTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  levelLabel: { color: Colors.primary, fontSize: 11, fontWeight: "900", letterSpacing: 1.5 },
  levelTitle: { color: Colors.text, fontSize: 22, fontWeight: "900", marginTop: 2 },
  xpPill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: Colors.background, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12 },
  xpText: { color: Colors.text, fontSize: 12, fontWeight: "800" },
  progressTrack: { height: 7, backgroundColor: Colors.border, borderRadius: 4, marginTop: 15, overflow: "hidden" },
  progressFill: { width: "62%", height: "100%", backgroundColor: Colors.primary, borderRadius: 4 },
  levelBottom: { flexDirection: "row", justifyContent: "space-between", marginTop: 7 },
  levelSmall: { color: Colors.textSecondary, fontSize: 11 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 5 },
  sectionTitle: { color: Colors.text, fontSize: 17, fontWeight: "800" },
  sectionAction: { color: Colors.primary, fontSize: 12, fontWeight: "800" },
  workoutCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: Colors.primary, flexDirection: "row", alignItems: "center" },
  workoutIcon: { width: 54, height: 54, borderRadius: 16, backgroundColor: Colors.background, alignItems: "center", justifyContent: "center" },
  workoutInfo: { flex: 1, marginLeft: 13 },
  workoutType: { color: Colors.primary, fontSize: 22, fontWeight: "900" },
  workoutName: { color: Colors.text, fontSize: 13, fontWeight: "700", marginTop: 1 },
  workoutMeta: { color: Colors.textSecondary, fontSize: 12, marginTop: 5 },
  startCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  recoveryCard: { backgroundColor: Colors.surface, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, flexDirection: "row", alignItems: "stretch", paddingVertical: 15 },
  metric: { flex: 1, alignItems: "center", gap: 4 },
  metricValue: { color: Colors.text, fontSize: 18, fontWeight: "900" },
  metricLabel: { color: Colors.textSecondary, fontSize: 11 },
  divider: { width: 1, backgroundColor: Colors.border },
  checkinButton: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 3, marginTop: -7 },
  checkinText: { color: Colors.primary, fontSize: 12, fontWeight: "800" },
  twoColumns: { flexDirection: "row", gap: 12 },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: Colors.border },
  statBig: { color: Colors.text, fontSize: 25, fontWeight: "900", marginTop: 7 },
  statLabel: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  progressCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 17, borderWidth: 1, borderColor: Colors.border },
  progressTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressBig: { color: Colors.text, fontSize: 27, fontWeight: "900" },
  progressLabel: { color: Colors.textSecondary, fontSize: 12 },
  trendBadge: { backgroundColor: Colors.background, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 9 },
  trendText: { color: Colors.primary, fontSize: 10, fontWeight: "900" },
  fakeChart: { height: 92, flexDirection: "row", alignItems: "flex-end", gap: 8, marginTop: 14 },
  chartBar: { flex: 1, backgroundColor: Colors.primary, borderRadius: 5, opacity: 0.75 },
  recordCard: { backgroundColor: Colors.surface, borderRadius: 18, padding: 17, borderWidth: 1, borderColor: Colors.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  recordExercise: { color: Colors.text, fontSize: 16, fontWeight: "800" },
  recordDate: { color: Colors.textSecondary, fontSize: 11, marginTop: 4 },
  recordValue: { color: Colors.primary, fontSize: 22, fontWeight: "900" },
  nextCard: { backgroundColor: Colors.surface, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: Colors.border, flexDirection: "row", alignItems: "center", gap: 12 },
  nextLabel: { color: Colors.textSecondary, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  nextValue: { color: Colors.text, fontSize: 16, fontWeight: "800", marginTop: 3 },
});
