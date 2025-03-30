import React, { useState, useEffect } from 'react';
import {
  IntervalExercisePrescription,
  ExerciseVariationParam,
  Group,
  ExerciseVariation,
  PlanInterval,
  CreateExerciseParameterTypeDto,
} from '@/services/types';
import { X } from 'lucide-react';
import NewExerciseTab from './new-exercise-tab';
import ReuseExerciseTab from './reuse-exercise-tab';
import { Tabs, TabItem } from '../ui/tabs';
import { Button } from 'shad/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from '@heroui/drawer';
import { useDisclosure } from '@heroui/react';
import { useExercises, useParameterTypes } from '@/services/hooks';
import { Loader2 } from 'lucide-react'; // Import Loader icon
import { useCreatePrescription } from '@/services/hooks';
import { useCreateExerciseVariation } from '@/services/hooks';
import { useCreateExercise } from '@/services/hooks';

// Export the type for the form state within the sidebar
export interface ExerciseFormData {
  id: number | null;
  variationId: number | null;
  name: string;
  description: string | null;
  sets: number;
  reps: number | null;
  rest: string | null;
  rpe: number | null;
  durationMinutes: string | null;
  parameters: CreateExerciseParameterTypeDto[];
}

interface ExerciseSidebarProps {
  prescriptionToEdit?: IntervalExercisePrescription | null;
  onClose: () => void;
  currentGroup: Group | null;
  interval: PlanInterval;
  isOpen: boolean;
}

const ExerciseSidebar: React.FC<ExerciseSidebarProps> = ({
  prescriptionToEdit,
  onClose,
  currentGroup,
  interval,
  isOpen,
}) => {
  const {
    isOpen: isDrawerOpen,
    onOpenChange,
    onClose: onCloseDrawer,
  } = useDisclosure({ isOpen, onClose });

  const { mutateAsync: createExercise, isPending: createExerciseLoading } = useCreateExercise({
    intervalId: interval.id,
  });
  const { mutateAsync: createPrescription, isPending: createPrescriptionLoading } =
    useCreatePrescription();
  const { mutateAsync: createExerciseVariation, isPending: createExerciseVariationLoading } =
    useCreateExerciseVariation({ intervalId: interval.id });
  const { data: allExercises, isLoading: exercisesLoading } = useExercises({ userId: 1 });
  const { data: parameterTypes, isLoading: parameterTypesLoading } = useParameterTypes({
    userId: 1,
  });

  const isLoading = exercisesLoading || parameterTypesLoading;
  const isSaving =
    createExerciseLoading || createPrescriptionLoading || createExerciseVariationLoading;

  const [activeTab, setActiveTab] = useState<'new' | 'reuse'>('reuse');
  const [formData, setFormData] = useState<ExerciseFormData>({
    id: null,
    variationId: null,
    name: '',
    description: '',
    sets: 3,
    reps: 10,
    rest: 60,
    rpe: null,
    durationMinutes: null,
    parameters: [],
  });

  const onVariantSelect = (variant: ExerciseVariation) => {
    const params: Record<number, string | null> = {};
    const locked: Record<number, string | null> = {};

    variant.parameters?.forEach((param: ExerciseVariationParam) => {
      if (param.locked) {
        locked[param.parameterTypeId] = null;
      } else {
        params[param.parameterTypeId] = null;
      }
    });

    setFormData({
      ...formData,
      name: variant.name,
      variationId: variant.id,
    });
    setActiveTab('new');
  };

  useEffect(() => {
    if (prescriptionToEdit) {
      setActiveTab('new'); // Editing always starts in the 'new' tab view for now
      const variation = prescriptionToEdit.exerciseVariation;
      const params: Record<number, string | null> = {};
      const locked: Record<number, string | null> = {};

      variation?.parameters?.forEach((param: ExerciseVariationParam) => {
        if (param.locked) {
          locked[param.parameterTypeId] = null;
        } else {
          params[param.parameterTypeId] = null;
        }
      });

      setFormData({
        id: prescriptionToEdit.id,
        variationId: variation?.id ?? null,
        name: variation?.name ?? 'Unknown Exercise',
        description: prescriptionToEdit.exerciseVariation?.exercise?.description ?? '',
        sets: prescriptionToEdit.sets ?? null,
        reps: prescriptionToEdit.reps ?? null,
        rest: prescriptionToEdit.rest ?? null,
        durationMinutes: prescriptionToEdit.duration ?? null, // Assuming duration is in minutes
        rpe: prescriptionToEdit.rpe ?? null,
        parameters: [],
      });
    } else {
      setActiveTab('reuse'); // Default to reuse tab when creating new
      setFormData({
        id: null,
        variationId: null,
        name: '',
        description: null,
        sets: 3,
        reps: 10,
        rest: 60,
        rpe: null,
        durationMinutes: null,
        parameters: [],
      });
    }
  }, [prescriptionToEdit]); // Depend on prescriptionToEdit

  const handleFormChange = (field: keyof ExerciseFormData, value: any) => {
    setFormData((prev) => {
      const newState = { ...prev, [field]: value };

      return newState;
    });
  };

  const handleSave = async () => {
    if (!formData.id && currentGroup && interval) {
      const exercise = await createExercise({
        name: formData.name,
        description: formData.description ?? '',
        userId: 1,
      });
      const variation = await createExerciseVariation({
        exerciseId: exercise.id,
        parameterTypes: formData.parameters,
      });
      await createPrescription({
        groupId: currentGroup.id,
        planIntervalId: interval.id,
        exerciseVariationId: variation.id,
        sets: formData.sets,
        reps: formData.reps ?? undefined,
        rest: formData.rest ?? undefined,
        rpe: formData.rpe ?? 0,
        duration: formData.durationMinutes ?? '10 minutes',
      });
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
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <>
              {activeTab === 'new' && formData && (
                <NewExerciseTab
                  formData={formData}
                  onFormChange={handleFormChange}
                  allExercises={allExercises || []}
                  parameterTypes={parameterTypes || []}
                />
              )}

              {activeTab === 'reuse' && formData && (
                <ReuseExerciseTab exercises={allExercises || []} onSelect={onVariantSelect} />
              )}
            </>
          )}
        </DrawerBody>

        <DrawerFooter className="border-t p-4 bg-gray-50">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData || isSaving}>
              Save
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ExerciseSidebar;
