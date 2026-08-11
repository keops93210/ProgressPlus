import type { GlobalProgressInputs } from "@/services/progress-global-score.service";

export function getNextProgressAction(input: GlobalProgressInputs) {
  const candidates = Object.entries(input).filter(([,value]) => typeof value === "number" && Number.isFinite(value)) as [keyof GlobalProgressInputs, number][];
  if (!candidates.length) return { title: "Commence par enregistrer tes données", message: "Une fois tes séances, récupération et évolution corporelle enregistrées, Progress+ pourra te guider.", pillar: null };
  const [key,value] = [...candidates].sort((a,b)=>a[1]-b[1])[0];
  const map: Record<keyof GlobalProgressInputs,{title:string;message:string}> = {
    transformationScore:{title:"Mesure ton évolution",message:"Ajoute régulièrement tes mensurations pour mieux comprendre ta transformation."},
    performanceScore:{title:"Cherche une progression contrôlée",message:"Concentre-toi sur la qualité d'exécution et une petite progression plutôt qu'un saut brutal."},
    recoveryScore:{title:"Priorité à la récupération",message:"Avant de pousser plus fort, améliore sommeil, énergie et récupération."},
    consistencyScore:{title:"Travaille ta régularité",message:"La meilleure progression vient d'un rythme que tu peux maintenir sur la durée."},
  };
  return { ...map[key], pillar:key, score:value };
}
