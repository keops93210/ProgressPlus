import { router } from "expo-router";
import { ChevronLeft, Download, Heart, Star, TrendingUp } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import {
  CommunityProgram,
  CommunitySort,
  downloadCommunityProgram,
  getCommunityPrograms,
  toggleCommunityFavorite,
} from "@/services/community-program.service";

const filters: { key: CommunitySort; label: string }[] = [
  { key: "weekly", label: "🔥 Top de la semaine" },
  { key: "rating", label: "⭐ Mieux notés" },
  { key: "downloads", label: "📥 Plus téléchargés" },
  { key: "new", label: "🆕 Nouveaux" },
];

export default function CommunityPrograms() {
  const [sort, setSort] = useState<CommunitySort>("weekly");
  const [programs, setPrograms] = useState<CommunityProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getCommunityPrograms(sort);
      setPrograms(data);
    } catch {
      setPrograms([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sort]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDownload(program: CommunityProgram) {
    try {
      setDownloading(program.id);
      await downloadCommunityProgram(program.id);
      await load();
    } finally {
      setDownloading(null);
    }
  }

  async function handleFavorite(program: CommunityProgram) {
    await toggleCommunityFavorite(program.id);
    await load();
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          >
            <ChevronLeft size={27} color={Colors.text} strokeWidth={2.5} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Programmes</Text>
            <Text style={styles.subtitle}>Découvre les programmes de la communauté</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map((filter) => {
            const active = sort === filter.key;
            return (
              <Pressable
                key={filter.key}
                onPress={() => setSort(filter.key)}
                style={[styles.filter, active && styles.filterActive]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.freeBanner}>
          <TrendingUp size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.freeTitle}>100 % gratuit</Text>
            <Text style={styles.freeText}>Les programmes partagés par la communauté sont accessibles à tous.</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 50 }} />
        ) : programs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>La communauté démarre ici</Text>
            <Text style={styles.emptyText}>Publie un programme pour devenir l'un des premiers créateurs Progress+.</Text>
          </View>
        ) : (
          programs.map((program, index) => (
            <View key={program.id} style={styles.card}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.programName}>{program.name}</Text>
                <Text style={styles.creator}>par {program.creator_name}</Text>
                <Text style={styles.description} numberOfLines={2}>
                  {program.description || "Programme d'entraînement Progress+."}
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Star size={15} color={Colors.primary} fill={Colors.primary} />
                    <Text style={styles.metaText}>
                      {program.rating_average ? program.rating_average.toFixed(1) : "Nouveau"}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Download size={15} color={Colors.textSecondary} />
                    <Text style={styles.metaText}>{program.downloads_count}</Text>
                  </View>
                  <Text style={styles.category}>{program.category}</Text>
                </View>

                <View style={styles.actions}>
                  <Pressable
                    onPress={() => handleDownload(program)}
                    disabled={downloading === program.id}
                    style={({ pressed }) => [styles.downloadButton, pressed && styles.pressed]}
                  >
                    {downloading === program.id ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Download size={18} color="#FFFFFF" />
                        <Text style={styles.downloadText}>AJOUTER À MES PROGRAMMES</Text>
                      </>
                    )}
                  </Pressable>
                  <Pressable onPress={() => handleFavorite(program)} style={styles.favoriteButton}>
                    <Heart size={19} color={Colors.primary} />
                  </Pressable>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 22 },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: Colors.surfaceLight },
  headerCopy: { flex: 1, marginLeft: 10 },
  title: { color: Colors.text, fontSize: 30, fontWeight: "900" },
  subtitle: { color: Colors.textSecondary, marginTop: 3, fontSize: 14 },
  filters: { gap: 9, paddingBottom: 14 },
  filter: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  filterActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: Colors.textSecondary, fontSize: 13, fontWeight: "700" },
  filterTextActive: { color: "#FFFFFF" },
  freeBanner: { flexDirection: "row", gap: 12, padding: 15, borderRadius: 18, backgroundColor: Colors.surfaceLight, marginBottom: 16 },
  freeTitle: { color: Colors.primary, fontWeight: "900", fontSize: 15 },
  freeText: { color: Colors.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 2 },
  card: { flexDirection: "row", backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 20, padding: 15, marginBottom: 12 },
  rankBadge: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.surfaceLight, alignItems: "center", justifyContent: "center", marginRight: 12 },
  rankText: { color: Colors.primary, fontWeight: "900" },
  cardBody: { flex: 1 },
  programName: { color: Colors.text, fontSize: 18, fontWeight: "900" },
  creator: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  description: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18, marginTop: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: Colors.textSecondary, fontSize: 12, fontWeight: "700" },
  category: { color: Colors.primary, fontSize: 11, fontWeight: "800", marginLeft: "auto" },
  actions: { flexDirection: "row", gap: 8, marginTop: 13 },
  downloadButton: { flex: 1, minHeight: 44, borderRadius: 13, backgroundColor: Colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingHorizontal: 10 },
  downloadText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  favoriteButton: { width: 44, borderRadius: 13, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", padding: 45 },
  emptyTitle: { color: Colors.text, fontSize: 20, fontWeight: "900", textAlign: "center" },
  emptyText: { color: Colors.textSecondary, textAlign: "center", marginTop: 8, lineHeight: 20 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
});
