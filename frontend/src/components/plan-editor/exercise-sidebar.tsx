import React, { useState, useEffect } from 'react';
import {
  Exercise as ServiceExercise,
  Group,
  IntervalExercisePrescription,
  ExerciseVariationParam,
} from '@/services/types';
import { X } from 'lucide-react';
import NewExerciseTab from './new-exercise-tab';
import ReuseExerciseTab from './reuse-exercise-tab';
import { Tabs, TabItem } from '../ui/tabs';
import { Button } from 'shad/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from '@heroui/drawer';
import { useDisclosure } from '@heroui/react';

// Export the type for the form state within the sidebar
export interface ExerciseFormData {
  id: number | null;
  exerciseId: number | null;
  name: string;
  description: string | null;
  sets: number | null;
  reps: number | null;
  rest: number | null;
  rpe: number | null;
  durationMinutes: number | null;
  parameters: Record<string, number>;
  lockedParameters: Record<string, boolean>;
  exercise: ServiceExercise | null;
}

interface ExerciseSidebarProps {
  prescriptionToEdit?: IntervalExercisePrescription | null;
  allExercises: ServiceExercise[];
  allGroups: Group[];
  onClose: () => void;
  onSave: (formData: ExerciseFormData) => void;
  isOpen: boolean;
}

const ExerciseSidebar: React.FC<ExerciseSidebarProps> = ({
  prescriptionToEdit,
  allExercises,
  allGroups,
  onClose,
  onSave,
  isOpen,
}) => {
  const {
    isOpen: isDrawerOpen,
    onOpenChange,
    onClose: onCloseDrawer,
  } = useDisclosure({ isOpen, onClose });

  const [activeTab, setActiveTab] = useState<'new' | 'reuse'>('reuse');
  const [formData, setFormData] = useState<ExerciseFormData>({
    id: null,
    exerciseId: null,
    name: '',
    description: null,
    sets: 3,
    reps: 10,
    rest: 60,
    rpe: null,
    durationMinutes: null,
    parameters: {},
    lockedParameters: {},
    exercise: null,
  });

  useEffect(() => {
    if (prescriptionToEdit) {
      setActiveTab('new'); // Editing always starts in the 'new' tab view for now
      const variation = prescriptionToEdit.exerciseVariation;
      const exercise = variation?.exercise;
      const params: Record<string, number> = {};
      const locked: Record<string, boolean> = {};

      variation?.parameters?.forEach((param: ExerciseVariationParam) => {
        // Assuming parameter value is stored elsewhere or needs fetching;
        // Using placeholder 0 for now. The key is the parameterTypeId.
        // Also assuming the actual value isn't stored directly in ExerciseVariationParam.
        // This part might need adjustment based on how parameter values are actually stored/retrieved.
        params[param.parameterTypeId.toString()] = 0; // Placeholder value
        locked[param.parameterTypeId.toString()] = param.locked;
      });

      setFormData({
        id: prescriptionToEdit.id,
        exerciseId: variation?.exerciseId ?? null,
        name: exercise?.name ?? 'Unknown Exercise',
        description: exercise?.description ?? null,
        sets: prescriptionToEdit.sets ?? null,
        reps: prescriptionToEdit.reps ?? null,
        rest: prescriptionToEdit.rest ?? null,
        exercise: exercise ?? null,
        durationMinutes: prescriptionToEdit.duration ?? null, // Assuming duration is in minutes
        rpe: prescriptionToEdit.rpe ?? null,
        parameters: params, // Needs actual values
        lockedParameters: locked,
      });
    } else {
      setActiveTab('reuse'); // Default to reuse tab when creating new
      setFormData({
        id: null,
        exerciseId: null,
        name: '',
        description: null,
        sets: 3,
        reps: 10,
        rest: 60,
        rpe: null,
        durationMinutes: null,
        parameters: {},
        lockedParameters: {},
        exercise: null,
      });
    }
  }, [prescriptionToEdit, allExercises]); // Added allExercises to dependency array

  const handleFormChange = (field: keyof ExerciseFormData, value: any) => {
    setFormData((prev) => {
      const newState = { ...prev, [field]: value };

      if (field === 'exerciseId') {
        const selectedExercise = allExercises.find((ex) => ex.id === value) || null;
        return {
          ...newState,
          exerciseId: value,
          exercise: selectedExercise,
          name: selectedExercise ? selectedExercise.name : newState.name,
          description: selectedExercise ? selectedExercise.description : newState.description,
          parameters: selectedExercise ? {} : newState.parameters,
          lockedParameters: selectedExercise ? {} : newState.lockedParameters,
        };
      }

      if (field === 'exercise' && value) {
        const newExercise = value as ServiceExercise;
        return {
          ...newState,
          exercise: newExercise,
          exerciseId: newExercise.id,
          name: newExercise.name,
          description: newExercise.description,
          parameters: {},
          lockedParameters: {},
        };
      }

      return newState;
    });
  };

  const handleSave = () => {
    if (formData) {
      onSave(formData);
    }
    onClose();
  };

  const tabItems: TabItem[] = [
    { id: 'new', label: 'Edit Details' },
    { id: 'reuse', label: 'Select Exercise' },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'new' | 'reuse');
  };

  const drawerCloseButton = (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full hover:bg-gray-100 absolute right-4 top-4 z-10"
    >
      <X className="h-5 w-5" />
    </Button>
  );

  return (
    <Drawer
      isOpen={isDrawerOpen}
      onOpenChange={onOpenChange}
      onClose={onCloseDrawer}
      placement="right"
      size="lg"
      closeButton={drawerCloseButton}
    >
      <DrawerContent className="flex flex-col h-full">
        <DrawerHeader className="border-b px-4 py-4">
          <h2 className="text-xl font-semibold">Add Exercise</h2>
        </DrawerHeader>

        <div className="border-b">
          <Tabs
            tabs={tabItems}
            activeTabId={activeTab}
            onTabChange={handleTabChange}
            equalWidth={true}
          />
        </div>

        <DrawerBody
          className={`flex-1 ${activeTab === 'reuse' ? 'overflow-hidden p-6 pb-0' : 'overflow-auto p-6'}`}
        >
          {activeTab === 'new' && formData && (
            <NewExerciseTab formData={formData} onFormChange={handleFormChange} />
          )}

          {activeTab === 'reuse' && formData && (
            <ReuseExerciseTab
              exercises={allExercises}
              formData={formData}
              onFormChange={handleFormChange}
            />
          )}
        </DrawerBody>

        <DrawerFooter className="border-t p-4 bg-gray-50">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData}>
              Save
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ExerciseSidebar;
