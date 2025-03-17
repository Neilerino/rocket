import { Group } from '@/services/types';
import React from 'react';
import ExerciseCard from './exercise-card';
import { Plus } from 'lucide-react';
import { Exercise, ExercisePrescription } from './types';

// Extended Group interface with exercises
interface GroupWithExercises extends Group {
  exercises: ExercisePrescription[];
}

interface GroupDropDownProps {
  group: GroupWithExercises;
  allExercises: Exercise[];
  setSelectedExercise: (exercise: Exercise | null) => void;
  setCurrentGroup: (group: Group | null) => void;
  setExerciseDrawerOpen: (open: boolean) => void;
}

const GroupDropDown: React.FC<GroupDropDownProps> = ({
  group,
  allExercises,
  setSelectedExercise,
  setCurrentGroup,
  setExerciseDrawerOpen,
}) => {
  return (
    <div key={group.id} className="space-y-4">
      {/* Add Exercises Card - Now at the top */}
      <div
        className="cursor-pointer hover:shadow-md transition-all overflow-hidden border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-lg"
        onClick={() => {
          setSelectedExercise(null);
          setCurrentGroup(group);
          setExerciseDrawerOpen(true);
        }}
      >
        <div className="flex flex-row items-center justify-center gap-2 py-4 bg-gradient-to-r from-gray-50 to-white">
          <div className="w-5 h-5 text-primary flex-shrink-0 rounded-full bg-primary/10 p-0.5">
            <Plus className="w-full h-full" />
          </div>
          <h3 className="font-medium text-gray-600">Add Exercises</h3>
        </div>
      </div>

      {group.exercises.map((prescription, index) => {
        // Create a minimal exercise object from the prescription
        const exercise: Partial<Exercise> = {
          name: prescription.exerciseId
            ? allExercises.find((e) => e.id === prescription.exerciseId)?.name || 'Unknown Exercise'
            : 'Custom Exercise',
          description: '',
        };

        return (
          <div key={index} className="mb-4">
            <ExerciseCard
              exercise={exercise as Exercise}
              prescription={prescription}
              onEdit={() => {
                // Create a full exercise object if we have one
                if (prescription.exerciseId) {
                  const fullExercise = allExercises.find((e) => e.id === prescription.exerciseId);
                  if (fullExercise) {
                    setSelectedExercise(fullExercise);
                  } else {
                    // Create a minimal exercise if we can't find the full one
                    const minimalExercise: Exercise = {
                      id: prescription.exerciseId,
                      name: exercise.name || 'Unknown',
                      description: exercise.description || '',
                      variations: [],
                    };
                    setSelectedExercise(minimalExercise);
                  }
                } else {
                  // For custom exercises without an ID
                  const customExercise: Exercise = {
                    id: prescription.id || '',
                    name: exercise.name || 'Custom Exercise',
                    description: exercise.description || '',
                    variations: [],
                  };
                  setSelectedExercise(customExercise);
                }
                
                setCurrentGroup(group);
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default GroupDropDown;
