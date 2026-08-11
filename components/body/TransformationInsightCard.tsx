import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import type { BodyMeasurement } from "@/services/body-progress.service";
import { getTransformationScore } from "@/services/body-progress-score.service";

type Props = { current: BodyMeasurement | null; previous: BodyMeasurement | null };

export function TransformationInsightCard({ current, previous }: Props) {
  const score = getTransformationScore(current, previous);
  const waist = current?.waist_cm != null && previous?.waist_cm != null ? current.waist_cm - previous.waist_cm : null;
  const arm = current?.arm_cm != null && previous?.arm_cm != null ? current.arm_cm - previous.arm_cm : null;
  const weight = current?.weight_kg != null && previous?.weight_kg != null ? current.weight_kg - previous.weight_kg : null;
  let message = "Ajoute une deuxième mesure pour que Progress+ puisse analyser ta transformation.";
  if (score.score != null) {
    if (waist != null && waist < 0 && arm != null && arm >= 0) message = "Ton tour de taille diminue tandis que ton bras est maintenu ou en progression : signal favorable.";
    else if (weight != null && weight < 0 && waist != null && waist < 0) message = "Tu perds du poids et du tour de taille simultanément : la tendance actuelle est cohérente avec une perte de masse.";
    else if (waist != null && waist > 0) message = "Le tour de taille progresse. Progress+ recommande de surveiller la tendance sur les prochaines mesures avant de modifier le plan.";
    else message = "Les données actuelles montrent une évolution à surveiller dans le temps. Continue à mesurer dans des conditions similaires.";
  }
  return <View style={styles.card}><Text style={styles.eyebrow}>COACH TRANSFORMATION</Text><Text style={styles.title}>Ce que tes données racontent</Text><Text style={styles.message}>{message}</Text><View style={styles.tags}><Text style={styles.tag}>{score.score == null ? "EN ATTENTE" : score.label.toUpperCase()}</Text>{score.score != null ? <Text style={styles.tag}>SCORE {score.score}/100</Text> : null}</View></View>;
}

const styles=StyleSheet.create({card:{backgroundColor:Colors.surface,borderRadius:20,borderWidth:1,borderColor:Colors.border,padding:16},eyebrow:{color:Colors.primaryLight,fontSize:9,fontWeight:"900",letterSpacing:1.2},title:{color:Colors.text,fontSize:18,fontWeight:"900",marginTop:4},message:{color:Colors.textSecondary,fontSize:12,lineHeight:19,marginTop:10},tags:{flexDirection:"row",gap:8,marginTop:13},tag:{color:Colors.primaryLight,borderColor:Colors.primary,borderWidth:1,borderRadius:8,paddingHorizontal:9,paddingVertical:6,fontSize:9,fontWeight:"900"}});
