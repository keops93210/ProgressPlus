import { supabase } from "@/lib/supabase";
import { addExerciseToProgram, createProgram } from "@/services/program.service";
import { Exercise } from "@/types/exercise";

export type ProgramGoal = "muscle" | "strength" | "fat_loss";
export type ProgramLevel = "beginner" | "intermediate" | "advanced";

export type AdaptiveProgramInput = {
  userId: string;
  daysPerWeek: 2 | 3 | 4 | 5 | 6;
  goal: ProgramGoal;
  level: ProgramLevel;
  equipment?: string[];
  sessionMinutes?: 45 | 60 | 75 | 90;
};

export type AdaptiveProgramDraft = {
  name: string;
  description: string;
  days: Array<{
    name: string;
    exercises: Array<{
      exerciseId: string;
      exerciseName: string;
      sets: number;
      minReps: number;
      maxReps: number;
      restSeconds: number;
    }>;
  }>;
};

const MUSCLE_ALIASES: Record<string, string[]> = {
  chest: ["chest", "pectoraux", "pecs"],
  back: ["back", "dos", "lats"],
  shoulders: ["shoulders", "épaules", "epaules", "delts"],
  biceps: ["biceps"],
  triceps: ["triceps"],
  quads: ["quadriceps", "quads", "cuisses", "legs"],
  hamstrings: ["hamstrings", "ischios", "ischio-jambiers"],
  glutes: ["glutes", "fessiers", "gluteus"],
  calves: ["calves", "mollets"],
  abs: ["abs", "abdos", "core", "abdominal"],
};

const SPLITS: Record<number, string[][]> = {
  2: [["full"], ["full"]],
  3: [["push"], ["pull"], ["legs"]],
  4: [["upper"], ["lower"], ["upper"], ["lower"]],
  5: [["push"], ["pull"], ["legs"], ["upper"], ["lower"]],
  6: [["push"], ["pull"], ["legs"], ["push"], ["pull"], ["legs"]],
};

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function matchesMuscle(exercise: Exercise, key: string) {
  const aliases = (MUSCLE_ALIASES[key] ?? []).map(normalize);
  const primary = normalize(exercise.primary_muscle ?? "");
  return aliases.some((alias) => primary.includes(alias));
}

function equipmentAllowed(exercise: Exercise, equipment?: string[]) {
  if (!equipment?.length) return true;
  const wanted = equipment.map(normalize);
  const actual = normalize(exercise.equipment ?? "");
  return !actual || wanted.some((item) => actual.includes(item) || item.includes(actual));
}

function scoreExercise(exercise: Exercise, preferredMuscles: string[], level: ProgramLevel, used: Set<string>) {
  if (used.has(exercise.id)) return -1000;
  let score = 0;
  const muscleIndex = preferredMuscles.findIndex((muscle) => matchesMuscle(exercise, muscle));
  if (muscleIndex >= 0) score += 100 - muscleIndex * 8;
  if (exercise.is_compound) score += 22;
  if (level === "beginner" && normalize(exercise.difficulty ?? "").includes("beginner")) score += 15;
  if (level === "advanced" && normalize(exercise.difficulty ?? "").includes("advanced")) score += 15;
  if (level === "intermediate" && normalize(exercise.difficulty ?? "").includes("intermediate")) score += 10;
  return score;
}

function preferences(goal: ProgramGoal, level: ProgramLevel) {
  const base = goal === "strength"
    ? ["chest", "back", "quads", "shoulders", "hamstrings", "triceps", "biceps"]
    : goal === "fat_loss"
      ? ["quads", "back", "chest", "hamstrings", "shoulders", "glutes", "abs"]
      : ["chest", "back", "quads", "glutes", "shoulders", "hamstrings", "biceps", "triceps"];
  return level === "advanced" ? [...base, "calves", "abs"] : base;
}

function settings(goal: ProgramGoal, level: ProgramLevel) {
  if (goal === "strength") return { sets: level === "beginner" ? 3 : 4, minReps: 4, maxReps: 6, rest: 180 };
  if (goal === "fat_loss") return { sets: 3, minReps: 8, maxReps: 12, rest: 90 };
  return { sets: 3, minReps: 8, maxReps: 12, rest: 120 };
}

function splitMuscles(split: string) {
  if (split === "push") return ["chest", "shoulders", "triceps"];
  if (split === "pull") return ["back", "biceps"];
  if (split === "legs") return ["quads", "hamstrings", "glutes", "calves"];
  if (split === "upper") return ["chest", "back", "shoulders", "biceps", "triceps"];
  if (split === "lower") return ["quads", "hamstrings", "glutes", "calves", "abs"];
  return ["chest", "back", "quads", "shoulders", "hamstrings", "biceps", "triceps"];
}

export async function buildAdaptiveProgram(input: AdaptiveProgramInput): Promise<AdaptiveProgramDraft> {
  const { data, error } = await supabase
    .from("exercises")
    .select("id, name, slug, primary_muscle, secondary_muscles, equipment, difficulty, instructions, image_url, video_url, is_compound, created_at")
    .order("name")
    .limit(500);
  if (error) throw error;

  const exercises = (data ?? []).filter((exercise) => equipmentAllowed(exercise as Exercise, input.equipment)) as Exercise[];
  if (!exercises.length) throw new Error("Aucun exercice compatible avec ton matériel n'a été trouvé.");

  const config = settings(input.goal, input.level);
  const split = SPLITS[input.daysPerWeek] ?? SPLITS[3];
  const used = new Set<string>();
  const maxExercises = input.sessionMinutes === 45 ? 5 : 7;

  const days = split.map((parts, index) => {
    const preferred = parts.flatMap(splitMuscles);
    const fallback = preferences(input.goal, input.level);
    const pool = [...preferred, ...fallback.filter((muscle) => !preferred.includes(muscle))];
    const selected: Exercise[] = [];

    for (const muscle of pool) {
      const candidates = exercises
        .filter((exercise) => matchesMuscle(exercise, muscle))
        .sort((a, b) => scoreExercise(b, pool, input.level, used) - scoreExercise(a, pool, input.level, used));
      const candidate = candidates.find((exercise) => !used.has(exercise.id));
      if (candidate) {
        selected.push(candidate);
        used.add(candidate.id);
      }
      if (selected.length >= maxExercises) break;
    }

    return {
      name: splitName(parts[0], index),
      exercises: selected.map((exercise, exerciseIndex) => ({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: exerciseIndex === 0 && input.goal === "strength" ? config.sets + 1 : config.sets,
        minReps: config.minReps,
        maxReps: config.maxReps,
        restSeconds: config.rest,
      })),
    };
  });

  return {
    name: `Progress+ ${input.goal === "strength" ? "Force" : input.goal === "fat_loss" ? "Sèche" : "Hypertrophie"} ${input.daysPerWeek} jours`,
    description: `Programme adaptatif généré selon ${input.daysPerWeek} jours/semaine, objectif ${input.goal}, niveau ${input.level}. Progress+ pourra ensuite ajuster les charges selon tes performances et ta récupération.`,
    days,
  };
}

function splitName(split: string, index: number) {
  const names: Record<string, string> = { push: "Push", pull: "Pull", legs: "Legs", upper: "Upper", lower: "Lower", full: "Full Body" };
  return `${names[split] ?? "Séance"} ${index + 1}`;
}

/**
 * Persists the generated sessions using the current data model, where each
 * workout program is a standalone routine. A future program-plan table can
 * group these routines without changing the generator itself.
 */
export async function createAdaptiveProgramPack(input: AdaptiveProgramInput) {
  const draft = await buildAdaptiveProgram(input);
  const programs = [];

  for (const day of draft.days) {
    const program = await createProgram(input.userId, day.name, `${draft.description} — ${day.name}`);
    for (const exercise of day.exercises) {
      await addExerciseToProgram(program.id, exercise.exerciseId, exercise.sets, exercise.minReps, exercise.maxReps, exercise.restSeconds);
    }
    programs.push({ id: program.id, name: program.name });
  }

  return { draft, programs };
}
