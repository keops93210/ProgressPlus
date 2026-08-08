export type ExerciseGuide = {
  primary: "chest" | "back" | "shoulders" | "biceps" | "triceps" | "quads" | "hamstrings" | "glutes" | "calves" | "abs";
  secondary: string[];
  intro: string;
  setup: string[];
  movement: string[];
  mistakes: string[];
  tip: string;
};

const guides: Record<string, ExerciseGuide> = {
  "Développé incliné haltères": {
    primary: "chest",
    secondary: ["Deltoïde antérieur", "Triceps"],
    intro: "Le banc incliné accentue la portion haute du grand pectoral.",
    setup: ["Incline le banc autour de 30°.", "Pieds stables au sol, omoplates légèrement rapprochées.", "Haltères au niveau du haut de la poitrine."],
    movement: ["Descends sous contrôle sans laisser les épaules partir vers l'avant.", "Pousse vers le haut en gardant les avant-bras presque verticaux.", "Ne verrouille pas brutalement les coudes."],
    mistakes: ["Banc trop incliné.", "Rebondir en bas du mouvement.", "Rapprocher excessivement les épaules des oreilles."],
    tip: "Pense à rapprocher les bras plutôt qu'à simplement pousser les haltères.",
  },
  "Développé couché barre": {
    primary: "chest",
    secondary: ["Triceps", "Deltoïde antérieur"],
    intro: "Un exercice de base pour développer la masse et la force des pectoraux.",
    setup: ["Pieds fermement au sol.", "Omoplates serrées et poitrine sortie.", "Prise légèrement plus large que les épaules."],
    movement: ["Descends la barre vers le bas des pectoraux.", "Marque un contrôle en bas.", "Pousse en gardant les épaules stables."],
    mistakes: ["Décoller les fesses du banc.", "Descendre trop haut vers le cou.", "Perdre la stabilité des omoplates."],
    tip: "Garde la même trajectoire à chaque répétition pour progresser proprement.",
  },
  "Arnold Press Haltères": {
    primary: "shoulders",
    secondary: ["Triceps", "Haut des pectoraux"],
    intro: "Le mouvement combine une rotation des bras et une poussée au-dessus de la tête.",
    setup: ["Dos stable et abdominaux légèrement contractés.", "Haltères devant les épaules, paumes vers toi.", "Évite de cambrer excessivement le bas du dos."],
    movement: ["Pousse en tournant progressivement les paumes vers l'avant.", "Monte jusqu'à une position confortable au-dessus de la tête.", "Redescends avec contrôle en inversant la rotation."],
    mistakes: ["Prendre trop lourd.", "Cambrer pour terminer la répétition.", "Faire la rotation trop rapidement."],
    tip: "Utilise une charge qui te permet de garder un mouvement fluide du début à la fin.",
  },
};

export function getExerciseGuide(name: string, primaryMuscle?: string): ExerciseGuide {
  if (guides[name]) return guides[name];
  const muscle = primaryMuscle?.toLowerCase() ?? "";
  const primary = muscle.includes("dos") || muscle.includes("dors") ? "back" : muscle.includes("épaule") || muscle.includes("epaule") ? "shoulders" : muscle.includes("triceps") ? "triceps" : muscle.includes("biceps") ? "biceps" : muscle.includes("jambe") || muscle.includes("quadr") ? "quads" : "chest";
  return {
    primary,
    secondary: [],
    intro: "Découvre les points clés pour réaliser cet exercice avec une technique propre.",
    setup: ["Adopte une position stable et confortable.", "Choisis une charge adaptée à ton objectif.", "Prépare le mouvement avant de démarrer la répétition."],
    movement: ["Réalise une amplitude contrôlée.", "Garde le mouvement fluide et stable.", "Contrôle aussi bien la montée que la descente."],
    mistakes: ["Utiliser une charge trop lourde.", "Réduire l'amplitude pour terminer les répétitions.", "Perdre le contrôle du mouvement."],
    tip: "La qualité des répétitions passe avant la charge.",
  };
}
