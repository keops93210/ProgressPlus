import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { getRankProgress, RankingProfile } from "@/services/ranking.service";

interface Props {
  profile: RankingProfile;
  position?: number;
}

export default function RankingCard({ profile, position }: Props) {
  const progress = getRankProgress(profile.score);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>PROGRESS RANK</Text>
          <Text style={styles.rank}>{profile.rank}</Text>
        </View>
        {position ? (
          <View style={styles.positionBox}>
            <Text style={styles.positionLabel}>CLASSEMENT</Text>
            <Text style={styles.position}>#{position}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.scoreRow}>
        <Text style={styles.score}>{profile.score.toLocaleString("fr-FR")}</Text>
        <Text style={styles.points}> points</Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress.percent * 100}%` }]} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {progress.next
            ? `${progress.pointsToNext.toLocaleString("fr-FR")} pts avant ${progress.next.name}`
            : "Rang maximum atteint"}
        </Text>
        <Text style={styles.season}>Saison {profile.season}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  eyebrow: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  rank: {
    color: Colors.text,
    fontSize: 30,
    fontWeight: "900",
    marginTop: 4,
  },
  positionBox: {
    alignItems: "flex-end",
  },
  positionLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: "800",
  },
  position: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 2,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 14,
  },
  score: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: "900",
  },
  points: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginLeft: 5,
  },
  track: {
    height: 8,
    borderRadius: 99,
    backgroundColor: Colors.surfaceLight,
    overflow: "hidden",
    marginTop: 14,
  },
  fill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 99,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  season: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
});
