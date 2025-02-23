import { Button } from 'shad/components/ui/button';
import { Exercise } from './types';

interface ExercisePrescription {
  exerciseId?: number;
  name?: string;
  description?: string;
  rpe?: number;
  sets: number;
  reps?: number;
  durationMinutes?: number;
  durationSeconds?: number;
  rest?: string;
  parameters: Record<string, number>;
}

interface ReuseExerciseTabProps {
  exercises: Exercise[];
  currentExerciseId?: number;
  onSelectExercise: (prescription: ExercisePrescription) => void;
}

const ReuseExerciseTab = ({ exercises, currentExerciseId, onSelectExercise }: ReuseExerciseTabProps) => {
  const availableExercises = exercises.filter(e => e.id !== currentExerciseId);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {availableExercises.map((exercise) => (
          <div
            key={exercise.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div>
              <h3 className="font-medium">{exercise.name}</h3>
              {exercise.description && (
                <p className="text-sm text-muted-foreground">
                  {exercise.description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onSelectExercise({
                  exerciseId: exercise.id,
                  sets: 3, // Default values
                  parameters: {},
                });
              }}
            >
              Use
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReuseExerciseTab;
