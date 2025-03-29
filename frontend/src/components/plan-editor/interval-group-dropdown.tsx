import { Group } from '@/services/types';
import React from 'react';
import ExerciseCard from './exercise-card';
import { Plus, Loader2, AlertTriangle } from 'lucide-react';
import { usePrescriptions } from '@/services/hooks';
import { Alert, AlertDescription, AlertTitle } from 'shad/components/ui/alert';
import { IntervalExercisePrescription, Exercise as ServiceExercise } from '@/services/types';

interface GroupDropDownProps {
  group: Group;
  setSelectedExercise: (exercise: ServiceExercise | null) => void;
  setCurrentGroup: (group: Group | null) => void;
  setExerciseDrawerOpen: (open: boolean) => void;
}

const GroupDropDown: React.FC<GroupDropDownProps> = ({
  group,
  setSelectedExercise,
  setCurrentGroup,
  setExerciseDrawerOpen,
}) => {
  const {
    data: prescriptions,
    isLoading,
    isError,
    error,
  } = usePrescriptions({
    groupId: group.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Loading prescriptions...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load prescriptions: {error instanceof Error ? error.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }

  const safePrescriptions = Array.isArray(prescriptions) ? prescriptions : [];

  return (
    <div key={group.id} className="space-y-4">
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
          <h3 className="font-medium text-gray-600">Add Exercise</h3>
        </div>
      </div>

      {safePrescriptions.map((prescription: IntervalExercisePrescription) => {
        // Directly get the service exercise data, handle if it's missing
        const exerciseData = prescription.exerciseVariation?.exercise;

        // If exercise data is missing, potentially skip or render a placeholder
        if (!exerciseData) {
          console.warn(`Missing exercise data for prescription ID: ${prescription.id}`);
          // Optionally return a placeholder or null
          // return <div key={prescription.id}>Missing exercise details</div>;
          return null; // Skip rendering this card
        }

        return (
          <div key={prescription.id} className="mb-4">
            {/* Pass service types directly to ExerciseCard */}
            <ExerciseCard
              exercise={exerciseData} // Pass ServiceExercise object
              prescription={prescription} // Pass IntervalExercisePrescription object
              onClick={() => {
                // Pass the service exercise object (or null) to the handler
                setSelectedExercise(exerciseData || null);
                setCurrentGroup(group);
                setExerciseDrawerOpen(true);
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default GroupDropDown;
