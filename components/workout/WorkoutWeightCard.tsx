import Card from "@/components/ui/Card";
import Counter from "@/components/ui/Counter";

interface WorkoutWeightCardProps {
  weight: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

export default function WorkoutWeightCard({
  weight,
  onIncrease,
  onDecrease,
}: WorkoutWeightCardProps) {
  return (
    <Card>
      <Counter
        title="Poids"
        value={weight}
        suffix="kg"
        onIncrease={onIncrease}
        onDecrease={onDecrease}
      />
    </Card>
  );
}