import { useState, useMemo } from 'react';
import { Button } from 'shad/components/ui/button';
import { Input } from 'shad/components/ui/input';
import { Label } from 'shad/components/ui/label';
import { X as CloseIcon, Plus } from 'lucide-react';
import { Exercise } from './types';
import { Group } from '@/services/types';

interface GroupFormData {
  id: number | undefined;
  name: string;
  description: string;
}

interface NewGroupTabProps {
  groupFormData: GroupFormData;
  onUpdateGroup: (group: GroupFormData) => void;
}

const NewGroupTab = ({ groupFormData, onUpdateGroup }: NewGroupTabProps) => {
  // const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const handleInputChange = (field: keyof Group, value: string) => {
    onUpdateGroup({
      ...groupFormData,
      [field]: value,
    });
  };

  // const handleAddExercise = () => {
  //   setSelectedExercise({
  //     id: '', // Will be set when saved
  //     name: '',
  //     sets: 3,
  //     rpe: 8,
  //     reps: 8,
  //     rest: 90,
  //   });
  // };

  // const handleEditExercise = (exercise: Exercise) => {
  //   setSelectedExercise(exercise);
  // };

  // const handleSaveExercise = (exercise: Exercise) => {
  //   const isNew = !exercise.id;
  //   const updatedExercises = isNew
  //     ? [...group.exercises, { ...exercise, id: crypto.randomUUID() }]
  //     : group.exercises.map((e) => (e.id === exercise.id ? exercise : e));

  //   onUpdateGroup({
  //     ...group,
  //     exercises: updatedExercises,
  //   });
  //   setSelectedExercise(null);
  // };

  // const handleDeleteExercise = (exerciseId: string) => {
  //   onUpdateGroup({
  //     ...group,
  //     exercises: group.exercises.filter((e) => e.id !== exerciseId),
  //   });
  // };

  // // Get all unique exercises from all groups
  // const allExercises = useMemo(() => {
  //   const exerciseMap = new Map<string, Exercise>();
  //   allGroups.forEach((g) => {
  //     g.exercises.forEach((e) => {
  //       if (!exerciseMap.has(e.id)) {
  //         exerciseMap.set(e.id, e);
  //       }
  //     });
  //   });
  //   return Array.from(exerciseMap.values());
  // }, [allGroups]);

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4">
        <div>
          <Label>Group Name</Label>
          <Input
            value={groupFormData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="mt-1"
          />
        </div>
        <Label>Group Description</Label>
        <Input
          value={groupFormData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="mt-1"
        />
        {/* <div>
          <Label>Frequency</Label>
          <Input
            value={group.frequency}
            onChange={(e) => handleInputChange('frequency', e.target.value)}
            className="mt-1"
          />
        </div> */}
      </div>

      {/* <div className="mt-6 flex-1">
        <h3 className="text-lg font-medium mb-4">Exercises</h3>
        <div className="space-y-3">
          {group.exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="border border-border rounded-lg p-4 hover:border-border/80 transition-colors bg-card"
            >
              <div className="flex items-center justify-between">
                <div className="cursor-pointer flex-1" onClick={() => handleEditExercise(exercise)}>
                  <h4 className="font-medium">{exercise.name}</h4>
                  <div className="text-sm text-muted-foreground mt-1">
                    <div>Sets: {exercise.sets}</div>
                    <div>RPE: {exercise.rpe}</div>
                    <div>Reps: {exercise.reps}</div>
                    <div>Rest: {exercise.rest}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteExercise(exercise.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <CloseIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <div
            className="border-dotted border-2 rounded-lg p-4 flex items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={handleAddExercise}
          >
            <div className="text-center">
              <div className="w-6 h-6 mx-auto mb-2 text-gray-400">
                <Plus />
              </div>
              <span className="text-sm font-medium text-gray-600">Add Exercise</span>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default NewGroupTab;
