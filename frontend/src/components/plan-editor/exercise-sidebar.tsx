import React, { useState } from 'react';
import {
  IntervalExercisePrescription,
  Group,
  PlanInterval,
  CreateExerciseParameterTypeDto,
} from '@/services/types';
import { X } from 'lucide-react';
import NewExerciseTab from './new-exercise-tab';
import ReuseExerciseTab from './reuse-exercise-tab';
import { Tabs } from '../ui/tabs';
import { Button } from 'shad/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from '@heroui/drawer';
import { useDisclosure } from '@heroui/react';
import { useExerciseForm } from './useExerciseForm';
import { mapPrescriptionToFormData } from './exerciseFormUtils';

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

  const [activeTab, setActiveTab] = useState<'new' | 'reuse'>('reuse');
  // const [selectedExercise, setSelectedExercise] = useState<ExerciseVariation | null>(null);

  const form = useExerciseForm({
    intervalId: interval.id,
    groupId: currentGroup?.id ?? -1,
    initialValues: prescriptionToEdit ? mapPrescriptionToFormData(prescriptionToEdit) : undefined,
  });

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
            tabs={[
              { id: 'new', label: 'New Exercise' },
              { id: 'reuse', label: 'Reuse Exercise' },
            ]}
            activeTabId={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as 'new' | 'reuse')}
            equalWidth={true}
          />
        </div>

        <DrawerBody
          className={`flex-1 ${activeTab === 'reuse' ? 'overflow-hidden p-6 pb-0' : 'overflow-auto p-6'}`}
        >
          {activeTab === 'new' && <NewExerciseTab form={form} parameterTypes={[]} />}

          {activeTab === 'reuse' && (
            <ReuseExerciseTab onSelect={() => {}} /> // Come back to this
          )}
        </DrawerBody>

        <DrawerFooter className="border-t p-4 bg-gray-5 0">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit}
              disabled={!form.state.isValid || form.state.isSubmitting}
            >
              Save
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ExerciseSidebar;
