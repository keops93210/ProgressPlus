import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

async function run() {
  console.log("Import des exercices...");

  const exercises = [
    {
      name: "Développé couché barre",
      primary_muscle: "Poitrine",
      secondary_muscles: ["Triceps", "Épaules"],
      equipment: "Barre",
      category: "Push",
      difficulty: "Intermédiaire",
      instructions: "",
      image_url: null,
      video_url: null,
      is_compound: true,
    },
    {
      name: "Développé incliné haltères",
      primary_muscle: "Poitrine",
      secondary_muscles: ["Épaules", "Triceps"],
      equipment: "Haltères",
      category: "Push",
      difficulty: "Intermédiaire",
      instructions: "",
      image_url: null,
      video_url: null,
      is_compound: true,
    },
    {
      name: "Élévations latérales",
      primary_muscle: "Épaules",
      secondary_muscles: [],
      equipment: "Haltères",
      category: "Push",
      difficulty: "Débutant",
      instructions: "",
      image_url: null,
      video_url: null,
      is_compound: false,
    },
  ];

  const { error } = await supabase
    .from("exercises")
    .insert(exercises);

  if (error) {
    console.error(error);
    return;
  }

  console.log("Import terminé.");
}

run();