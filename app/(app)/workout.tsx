import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import {
  createProgram,
  deleteProgram,
  getPrograms,
} from "@/services/program.service";
import { WorkoutProgram } from "@/types/program";

export default function Workout() {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadPrograms();
    }
  }, [user]);

  async function loadPrograms() {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getPrograms(user.id);
      setPrograms(data ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!user) {
      Alert.alert("Erreur", "Utilisateur non connecté");
      return;
    }

    if (!name.trim()) {
      Alert.alert("Erreur", "Entre un nom de programme.");
      return;
    }

    try {
      await createProgram(user.id, name);
      setName("");
      await loadPrograms();
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    }
  }

  async function handleDelete(id: string) {
    Alert.alert(
      "Supprimer",
      "Supprimer ce programme ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProgram(id);
              await loadPrograms();
            } catch (error: any) {
              Alert.alert("Erreur", error.message);
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          hitSlop={12}
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <ChevronLeft
            size={28}
            color={Colors.text}
            strokeWidth={2.5}
          />
        </Pressable>

        <Text style={styles.title}>Mes programmes</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Ex : PUSH"
        placeholderTextColor={Colors.textMuted}
        value={name}
        onChangeText={setName}
      />

      <Button
        title="CRÉER LE PROGRAMME"
        onPress={handleCreate}
      />

      <FlatList
        style={{ marginTop: 25 }}
        data={programs}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadPrograms}
        renderItem={({ item }) => (
          <Card>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(app)/program/[id]",
                  params: { id: item.id },
                })
              }
            >
              <Text style={styles.program}>{item.name}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.delete}>Supprimer</Text>
            </TouchableOpacity>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucun programme.</Text>
        }
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    backgroundColor: Colors.surfaceLight,
  },

  pressed: {
    opacity: 0.65,
    transform: [{ scale: 0.96 }],
  },

  title: {
    color: Colors.text,
    fontSize: 30,
    fontWeight: "800",
  },

  input: {
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    paddingHorizontal: 16,
    marginBottom: 18,
    fontSize: 16,
  },

  program: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  delete: {
    color: "#DC2626",
    fontWeight: "700",
  },

  empty: {
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 40,
  },
});
