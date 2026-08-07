import Card from "@/components/ui/Card";
import Counter from "@/components/ui/Counter";

interface WorkoutRepsCardProps {
  reps: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

export default function WorkoutRepsCard({
  reps,
  onIncrease,
  onDecrease,
}: WorkoutRepsCardProps) {
  return (
    <Card>
      <Counter
        title="Répétitions"
        value={reps}
        onIncrease={onIncrease}
        onDecrease={onDecrease}
      />
    </Card>
  );
}