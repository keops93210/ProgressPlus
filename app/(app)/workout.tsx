import { router } from "expo-router";
import { ChevronLeft, Compass, Globe2, LockKeyhole } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { createProgram, deleteProgram, getPrograms } from "@/services/program.service";
import { publishCommunityProgram, unpublishCommunityProgram } from "@/services/community-program.service";
import { WorkoutProgram } from "@/types/program";

export default function Workout() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  useEffect(() => { if (user) loadPrograms(); }, [user]);

  async function loadPrograms() {
    if (!user) return;
    try { setLoading(true); setPrograms((await getPrograms(user.id)) ?? []); }
    catch (error: any) { Alert.alert("Erreur", error.message); }
    finally { setLoading(false); }
  }

  async function handleCreate() {
    if (!user) { Alert.alert("Erreur", "Utilisateur non connecté"); return; }
    if (!name.trim()) { Alert.alert("Erreur", "Entre un nom de programme."); return; }
    try { await createProgram(user.id, name); setName(""); await loadPrograms(); }
    catch (error: any) { Alert.alert("Erreur", error.message); }
  }

  async function handlePublish(program: WorkoutProgram) {
    Alert.alert(
      "Publier dans la communauté",
      "Ton programme sera partagé gratuitement avec les autres utilisateurs. Tu pourras ensuite le retirer de la communauté.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Publier",
          onPress: async () => {
            try {
              setPublishingId(program.id);
              await publishCommunityProgram(program.id);
              await loadPrograms();
            } catch (error: any) {
              Alert.alert("Erreur", error.message);
            } finally {
              setPublishingId(null);
            }
          },
        },
      ],
    );
  }

  async function handleUnpublish(program: WorkoutProgram) {
    Alert.alert(
      "Retirer de la communauté",
      "Le programme ne sera plus proposé aux autres utilisateurs. Les téléchargements déjà effectués resteront dans leurs programmes.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Retirer",
          style: "destructive",
          onPress: async () => {
            try {
              setPublishingId(program.id);
              await unpublishCommunityProgram(program.id);
              await loadPrograms();
            } catch (error: any) {
              Alert.alert("Erreur", error.message);
            } finally {
              setPublishingId(null);
            }
          },
        },
      ],
    );
  }

  async function handleDelete(id: string) {
    Alert.alert("Supprimer", "Supprimer ce programme ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: async () => {
        try { await deleteProgram(id); await loadPrograms(); }
        catch (error: any) { Alert.alert("Erreur", error.message); }
      } },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <ChevronLeft size={28} color={Colors.text} strokeWidth={2.5} />
        </Pressable>
        <Text style={styles.title}>Mes programmes</Text>
      </View>

      <Pressable onPress={() => router.push("/(app)/community-programs")} style={({ pressed }) => [styles.communityButton, pressed && styles.pressed]}>
        <View style={styles.communityIcon}><Compass size={21} color={Colors.primary} strokeWidth={2.4} /></View>
        <View style={styles.communityCopy}>
          <Text style={styles.communityTitle}>Programmes de la communauté</Text>
          <Text style={styles.communitySubtitle}>Découvre et ajoute des programmes gratuits</Text>
        </View>
        <Text style={styles.communityArrow}>›</Text>
      </Pressable>

      <TextInput style={styles.input} placeholder="Ex : PUSH" placeholderTextColor={Colors.textMuted} value={name} onChangeText={setName} />
      <Button title="CRÉER LE PROGRAMME" onPress={handleCreate} />

      <FlatList
        style={{ marginTop: 25 }} data={programs} keyExtractor={(item) => item.id}
        refreshing={loading} onRefresh={loadPrograms}
        renderItem={({ item }) => (
          <Card>
            <TouchableOpacity onPress={() => router.push({ pathname: "/(app)/program/[id]", params: { id: item.id } })}>
              <Text style={styles.program}>{item.name}</Text>
            </TouchableOpacity>

            {item.is_published ? (
              <View style={styles.statusRow}>
                <View style={styles.publishedStatus}>
                  <Globe2 size={15} color={Colors.primary} strokeWidth={2.3} />
                  <Text style={styles.publishedText}>Publié dans la communauté</Text>
                </View>
                <View style={styles.statusSpacer} />
                <TouchableOpacity onPress={() => handleUnpublish(item)} disabled={publishingId === item.id}>
                  <Text style={styles.unpublish}>{publishingId === item.id ? "Retrait…" : "Retirer"}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.statusRow}>
                <View style={styles.privateStatus}>
                  <LockKeyhole size={15} color={Colors.textSecondary} strokeWidth={2.3} />
                  <Text style={styles.privateText}>Privé</Text>
                </View>
                <View style={styles.statusSpacer} />
                <TouchableOpacity onPress={() => handlePublish(item)} disabled={publishingId === item.id}>
                  <View style={styles.publishRow}>
                    <Globe2 size={16} color={Colors.primary} strokeWidth={2.2} />
                    <Text style={styles.publish}>{publishingId === item.id ? "Publication…" : "Publier dans la communauté"}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.programActions}>
              <TouchableOpacity onPress={() => handleDelete(item.id)}><Text style={styles.delete}>Supprimer</Text></TouchableOpacity>
            </View>
          </Card>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucun programme.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  backButton: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginRight: 6, backgroundColor: Colors.surfaceLight },
  pressed: { opacity: 0.65, transform: [{ scale: 0.97 }] },
  title: { color: Colors.text, fontSize: 30, fontWeight: "800" },
  communityButton: { flexDirection: "row", alignItems: "center", borderRadius: 18, padding: 14, marginBottom: 18, backgroundColor: Colors.surfaceLight, borderWidth: 1, borderColor: "#E4D9FF" },
  communityIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  communityCopy: { flex: 1, marginLeft: 12 },
  communityTitle: { color: Colors.text, fontSize: 15, fontWeight: "900" },
  communitySubtitle: { color: Colors.textSecondary, fontSize: 12, marginTop: 3 },
  communityArrow: { color: Colors.primary, fontSize: 28, fontWeight: "400", marginLeft: 8 },
  input: { height: 56, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, color: Colors.text, paddingHorizontal: 16, marginBottom: 18, fontSize: 16 },
  program: { color: Colors.text, fontSize: 20, fontWeight: "700", marginBottom: 12 },
  statusRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  privateStatus: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 5, paddingHorizontal: 9, borderRadius: 10, backgroundColor: Colors.surfaceLight },
  privateText: { color: Colors.textSecondary, fontWeight: "800", fontSize: 12 },
  publishedStatus: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 5, paddingHorizontal: 9, borderRadius: 10, backgroundColor: "#F1ECFF" },
  publishedText: { color: Colors.primary, fontWeight: "800", fontSize: 12 },
  statusSpacer: { flex: 1 },
  publishRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  publish: { color: Colors.primary, fontWeight: "800", fontSize: 13 },
  unpublish: { color: "#DC2626", fontWeight: "800", fontSize: 13 },
  programActions: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center" },
  delete: { color: "#DC2626", fontWeight: "700" },
  empty: { color: Colors.textSecondary, textAlign: "center", marginTop: 40 },
});
