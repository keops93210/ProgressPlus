import { Check, ShieldCheck, Timer, TrendingDown, TrendingUp } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";

type CoachNextSetCardProps = {
  weight: number;
  reps: number;
  minReps: number;
  maxReps: number;
  nextSet: number;
  totalSets: number;
  isPersonalRecord?: boolean;
  recoveryScore?: number | null;
  rir?: number | null;
  suggestedRestSeconds?: number;
  qualityScore?: number;
};

function formatRest(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

export default function CoachNextSetCard({ weight, reps, minReps, maxReps, nextSet, totalSets, isPersonalRecord = false, recoveryScore, rir, suggestedRestSeconds = 120, qualityScore }: CoachNextSetCardProps) {
  const isAboveTarget = reps >= maxReps;
  const isBelowTarget = reps < minReps;
  const recoveryLow = typeof recoveryScore === "number" && recoveryScore <= 2;
  const hardEffort = typeof rir === "number" && rir <= 1;
  const easyEffort = typeof rir === "number" && rir >= 4;
  const shouldIncreaseWeight = isAboveTarget && !hardEffort && !recoveryLow && weight > 0;
  const shouldConsolidate = recoveryLow || isBelowTarget || hardEffort;
  const nextWeight = shouldIncreaseWeight ? weight + 2.5 : weight;
  const nextReps = shouldConsolidate ? Math.min(maxReps, Math.max(minReps, isBelowTarget ? minReps : reps)) : shouldIncreaseWeight ? minReps : Math.min(maxReps, reps + 1);
  const decision = shouldIncreaseWeight ? "MONTER" : shouldConsolidate ? "CONSOLIDER" : "MAINTENIR";
  const confidence = shouldIncreaseWeight ? "ÉLEVÉE" : shouldConsolidate ? "PRUDENTE" : "MOYENNE";
  const confidenceMessage = hardEffort ? "RIR très bas : on protège la prochaine série plutôt que de forcer." : recoveryLow ? "La récupération limite volontairement la progression." : shouldIncreaseWeight ? "Performance et récupération cohérentes." : "Progression possible sans surcharge automatique.";
  const setQuality = hardEffort ? "Très exigeante" : isBelowTarget ? "À renforcer" : easyEffort ? "Facile" : isAboveTarget ? "Excellente" : "Productive";
  const stateColor = hardEffort || recoveryLow ? Colors.danger : easyEffort ? Colors.success : Colors.primary;
  const title = hardEffort ? "On récupère avant de repartir." : recoveryLow ? "On consolide aujourd'hui." : shouldIncreaseWeight ? "Tu as gagné le droit de monter." : isBelowTarget ? "On consolide avant de monter." : "Bonne série. On continue proprement.";
  const message = hardEffort ? `RIR ${rir}. Ne cherche pas à augmenter la charge sur la prochaine série.` : recoveryLow ? `Ta récupération est basse. Garde ${weight} kg et reste dans une zone maîtrisée.` : shouldIncreaseWeight ? `${maxReps} reps atteintes avec suffisamment de marge. Progress+ prépare ${nextWeight} kg.` : isBelowTarget ? `La série est sous la zone. Reste à ${weight} kg et vise au moins ${minReps} reps.` : `Objectif atteint à ${weight} kg. On cherche ${nextReps} reps sur la prochaine série.`;

  return (
    <View style={[styles.card, { borderColor: stateColor + "55" }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {hardEffort || recoveryLow ? <TrendingDown size={17} color={stateColor} /> : shouldIncreaseWeight ? <TrendingUp size={17} color={stateColor} /> : <Check size={17} color={stateColor} />}
          <Text style={[styles.eyebrow, { color: stateColor }]}>COACH PROGRESS+</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.decisionBadge, { borderColor: stateColor + "55", backgroundColor: stateColor + "14" }]}><Text style={[styles.decisionText, { color: stateColor }]}>{decision}</Text></View>
          <Text style={styles.setLabel}>{nextSet <= totalSets ? `SÉRIE ${nextSet}/${totalSets}` : "DERNIÈRE SÉRIE"}</Text>
        </View>
      </View>
      <View style={styles.setProgress}>{Array.from({ length: Math.max(1, totalSets) }).map((_, index) => { const setNumber = index + 1; return <View key={setNumber} style={[styles.setDot, setNumber < nextSet && { backgroundColor: stateColor + "65" }, setNumber === nextSet && { backgroundColor: stateColor, height: 6 }]} />; })}</View>
      <View style={styles.qualityRow}>
        <View style={styles.qualityCopy}><Text style={styles.qualityEyebrow}>QUALITÉ DE LA SÉRIE</Text><Text style={styles.qualityValue}>{setQuality}{typeof qualityScore === "number" ? ` · ${qualityScore}/100` : ""}</Text></View>
        <View style={[styles.qualityScore, { backgroundColor: stateColor + "18", borderColor: stateColor + "35" }]}><Text style={[styles.qualityScoreText, { color: stateColor }]}>{hardEffort ? "!" : reps >= minReps ? "✓" : "!"}</Text></View>
      </View>
      <Text style={styles.qualityMessage}>{typeof rir === "number" ? `RIR ${rir} · ${hardEffort ? "effort élevé" : easyEffort ? "marge importante" : "zone productive"}.` : "Effort non renseigné."}</Text>
      <View style={styles.confidenceRow}><ShieldCheck size={15} color={Colors.primary} /><View style={styles.confidenceCopy}><Text style={styles.confidenceLabel}>CONFIANCE DU COACH · {confidence}</Text><Text style={styles.confidenceMessage}>{confidenceMessage}</Text></View></View>
      <Text style={styles.title}>{title}</Text><Text style={styles.message}>{message}</Text>
      <View style={styles.nextTarget}><View style={styles.nextTargetCopy}><Text style={styles.nextTargetEyebrow}>PROCHAINE CIBLE</Text><Text style={styles.nextTargetValue}>{nextWeight} kg × {nextReps}</Text><Text style={styles.nextTargetHint}>Préparée automatiquement par Progress+</Text></View></View>
      <View style={styles.restRow}><Timer size={16} color={Colors.primary} /><View style={styles.restCopy}><Text style={styles.restEyebrow}>REPOS RECOMMANDÉ</Text><Text style={styles.restValue}>{formatRest(suggestedRestSeconds)}</Text></View><Text style={styles.restHint}>{suggestedRestSeconds > 180 ? "récupération longue" : suggestedRestSeconds < 90 ? "repos court" : "repos standard"}</Text></View>
      <View style={styles.targetRow}><View style={styles.metricBlock}><Text style={styles.label}>Dernière série</Text><Text style={styles.value}>{weight} kg × {reps}</Text></View><View style={styles.divider} /><View style={styles.metricBlock}><Text style={styles.label}>Zone</Text><Text style={styles.value}>{minReps}–{maxReps} reps</Text></View>{typeof recoveryScore === "number" && <><View style={styles.divider} /><View style={styles.metricBlock}><Text style={styles.label}>Récup.</Text><Text style={styles.value}>{recoveryScore.toFixed(1)}/5</Text></View></>}</View>
      {isPersonalRecord && <View style={styles.prBadge}><Text style={styles.prText}>🏆 NOUVEAU RECORD PERSONNEL</Text></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 16, backgroundColor: Colors.surface, borderWidth: 1, marginBottom: 14 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 7 }, eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 7 }, decisionBadge: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 999, borderWidth: 1 }, decisionText: { fontSize: 8, fontWeight: "900", letterSpacing: 0.6 }, setLabel: { color: Colors.textSecondary, fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  setProgress: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 13 }, setDot: { flex: 1, height: 4, borderRadius: 999, backgroundColor: Colors.border },
  qualityRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 15 }, qualityCopy: { flex: 1 }, qualityEyebrow: { color: Colors.textSecondary, fontSize: 9, fontWeight: "900", letterSpacing: 1 }, qualityValue: { color: Colors.text, fontSize: 16, fontWeight: "900", marginTop: 3 }, qualityScore: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: 1 }, qualityScoreText: { fontSize: 15, fontWeight: "900" }, qualityMessage: { color: Colors.textSecondary, fontSize: 11, lineHeight: 16, marginTop: 4 },
  confidenceRow: { flexDirection: "row", alignItems: "center", marginTop: 12, paddingTop: 11, borderTopWidth: 1, borderTopColor: Colors.border }, confidenceCopy: { flex: 1, marginLeft: 8 }, confidenceLabel: { color: Colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 0.7 }, confidenceMessage: { color: Colors.textSecondary, fontSize: 10, lineHeight: 15, marginTop: 2 },
  title: { color: Colors.text, fontSize: 17, fontWeight: "900", marginTop: 12 }, message: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 6 }, nextTarget: { marginTop: 14, borderRadius: 16, backgroundColor: Colors.primary + "12", borderWidth: 1, borderColor: Colors.primary + "35", padding: 14 }, nextTargetCopy: { alignItems: "center" }, nextTargetEyebrow: { color: Colors.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 }, nextTargetValue: { color: Colors.text, fontSize: 26, fontWeight: "900", marginTop: 4 }, nextTargetHint: { color: Colors.textSecondary, fontSize: 10, fontWeight: "600", marginTop: 3 },
  restRow: { flexDirection: "row", alignItems: "center", marginTop: 12, padding: 11, borderRadius: 13, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border }, restCopy: { marginLeft: 8 }, restEyebrow: { color: Colors.textSecondary, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 }, restValue: { color: Colors.text, fontSize: 18, fontWeight: "900", marginTop: 1 }, restHint: { marginLeft: "auto", color: Colors.textSecondary, fontSize: 9, fontWeight: "700" },
  targetRow: { flexDirection: "row", alignItems: "center", marginTop: 14, paddingTop: 13, borderTopWidth: 1, borderTopColor: Colors.border }, metricBlock: { flexShrink: 1 }, label: { color: Colors.textSecondary, fontSize: 9, fontWeight: "700", textTransform: "uppercase" }, value: { color: Colors.text, fontSize: 13, fontWeight: "900", marginTop: 3 }, divider: { width: 1, height: 30, backgroundColor: Colors.border, marginHorizontal: 10 }, prBadge: { alignSelf: "flex-start", marginTop: 12, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.success + "18" }, prText: { color: Colors.success, fontSize: 9, fontWeight: "900", letterSpacing: 0.6 },
});