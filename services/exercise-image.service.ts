import { Exercise } from "@/types/exercise";

const BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

type ImagePreset = { folder: string; frame?: number };

/** Central image resolver used by the exercise library, workout and detail screens. */
const PRESETS: Array<{ match: RegExp; image: ImagePreset }> = [
  { match: /développé\s+couché.*barre|bench\s*press.*barre/i, image: { folder: "Barbell_Bench_Press_-_Medium_Grip" } },
  { match: /développé\s+incliné.*halt[eè]res|incline.*dumbbell.*press/i, image: { folder: "Incline_Dumbbell_Press" } },
  { match: /développé\s+halt[eè]res|dumbbell\s+bench\s+press/i, image: { folder: "Dumbbell_Bench_Press" } },
  { match: /[ée]cart[ée].*incliné|incline.*dumbbell.*fly/i, image: { folder: "Incline_Dumbbell_Flyes" } },
  { match: /[ée]cart[ée].*halt[eè]res|dumbbell\s+fly/i, image: { folder: "Dumbbell_Flyes" } },
  { match: /dips?.*pectoraux|dips?.*chest/i, image: { folder: "Dips_-_Chest_Version" } },
  { match: /[ée]l[ée]vation[s]?\s+lat[ée]rale[s]?.*halt[eè]re|side.*lateral.*raise/i, image: { folder: "Side_Lateral_Raise" } },
  { match: /[ée]l[ée]vation[s]?\s+frontale[s]?.*halt[eè]re|front.*dumbbell.*raise/i, image: { folder: "Front_Dumbbell_Raise" } },
  { match: /oiseau.*halt[eè]re|rear.*delt.*raise|reverse.*fly/i, image: { folder: "Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench" } },
  { match: /développé\s+militaire.*halt[eè]re|shoulder\s+press.*dumbbell|arnold/i, image: { folder: "Arnold_Dumbbell_Press" } },
  { match: /rowing.*poitrine|chest.*supported.*row|rowing.*incliné/i, image: { folder: "Incline_Bench_Pull" } },
  { match: /rowing.*halt[eè]re|row.*dumbbell/i, image: { folder: "Bent_Over_Two-Dumbbell_Row" } },
  { match: /rowing.*barre|barbell.*row/i, image: { folder: "Bent_Over_Barbell_Row" } },
  { match: /tirage.*vertical|lat.*pulldown|pulldown/i, image: { folder: "Close-Grip_Front_Lat_Pulldown" } },
  { match: /tirage.*horizontal|seated.*cable.*row|rowing.*poulie/i, image: { folder: "Seated_Cable_Rows" } },
  { match: /curl.*marteau|hammer.*curl/i, image: { folder: "Hammer_Curls" } },
  { match: /curl.*halt[eè]re|dumbbell.*bicep.*curl/i, image: { folder: "Dumbbell_Bicep_Curl" } },
  { match: /curl.*barre|barbell.*curl/i, image: { folder: "Barbell_Curl" } },
  { match: /extension.*triceps.*poulie|triceps.*pushdown|pushdown/i, image: { folder: "Triceps_Pushdown" } },
  { match: /extension.*triceps.*halt[eè]re|dumbbell.*triceps.*extension/i, image: { folder: "Dumbbell_Tricep_Extension" } },
  { match: /squat.*barre|barbell.*squat/i, image: { folder: "Barbell_Full_Squat" } },
  { match: /squat.*goblet|goblet.*squat/i, image: { folder: "Goblet_Squat" } },
  { match: /presse.*cuisses|leg\s*press/i, image: { folder: "Leg_Press" } },
  { match: /extension.*quadriceps|leg.*extension/i, image: { folder: "Leg_Extensions" } },
  { match: /leg\s*curl|curl.*ischio|ischio.*machine/i, image: { folder: "Lying_Leg_Curls" } },
  { match: /soulev[ée].*terre|deadlift/i, image: { folder: "Barbell_Deadlift" } },
  { match: /hip\s*thrust|pont.*fessier.*barre/i, image: { folder: "Barbell_Hip_Thrust" } },
  { match: /fentes?.*halt[eè]res|dumbbell.*lunges/i, image: { folder: "Dumbbell_Lunges" } },
  { match: /mollets?.*(debout|machine)|standing.*calf/i, image: { folder: "Standing_Calf_Raises" } },
  { match: /mollets?.*assis|seated.*calf/i, image: { folder: "Seated_Calf_Raise" } },
  { match: /crunch/i, image: { folder: "Crunches" } },
  { match: /relev[ée].*jambes|hanging.*leg.*raise/i, image: { folder: "Hanging_Leg_Raise" } },
];

function presetFor(name: string | null | undefined): ImagePreset | null {
  if (!name) return null;
  return PRESETS.find((preset) => preset.match.test(name))?.image ?? null;
}

export function resolveExerciseImage(exercise: Pick<Exercise, "name" | "image_url">): string | null {
  if (exercise.image_url) return exercise.image_url;
  const preset = presetFor(exercise.name);
  if (!preset) return null;
  return `${BASE}${encodeURIComponent(preset.folder)}/${preset.frame ?? 0}.jpg`;
}

export function resolveExerciseImagePair(exercise: Pick<Exercise, "name" | "image_url">): string[] {
  const first = resolveExerciseImage(exercise);
  if (!first) return [];
  return [first, first.replace("/0.jpg", "/1.jpg")];
}
