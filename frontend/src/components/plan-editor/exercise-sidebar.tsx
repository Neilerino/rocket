import React, { useState } from 'react';
import { Exercise, ExercisePrescription, Group, ParameterType } from './types';
import { X } from 'lucide-react';
import NewExerciseTab from './new-exercise-tab';
import ReuseExerciseTab from './reuse-exercise-tab';
import { Tabs, TabItem } from '../ui/tabs';
import { Button } from 'shad/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from '@heroui/drawer';
import { useDisclosure } from '@heroui/react';
import { sampleExerciseVariants, sampleParameterTypes, ExerciseVariant } from './sample-data';

interface ExerciseSidebarProps {
  exercise?: Exercise;
  group?: Group | null;
  intervalId?: string;
  parameterTypes?: ParameterType[];
  allExercises?: Exercise[];
  onClose: () => void;
  onSave: (prescription: ExercisePrescription) => void;
  isOpen: boolean;
}

const ExerciseSidebar: React.FC<ExerciseSidebarProps> = ({
  exercise,
  group,
  intervalId,
  parameterTypes = [],
  allExercises = [],
  onClose,
  onSave,
  isOpen,
}) => {
  const {
    isOpen: isDrawerOpen,
    onOpenChange,
    onClose: onCloseDrawer,
  } = useDisclosure({ isOpen, onClose });

  const [activeTab, setActiveTab] = useState<'new' | 'reuse'>('new');
  const [prescription, setPrescription] = useState<ExercisePrescription>({
    exerciseId: exercise?.id,
    name: exercise?.name || '',
    sets: 3,
    reps: 10,
    parameters: {},
  });

  // Define the tab items
  const tabItems: TabItem[] = [
    { id: 'new', label: 'New Exercise' },
    { id: 'reuse', label: 'Reuse Exercise' },
  ];

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'new' | 'reuse');
  };

  const handleSave = () => {
    onSave(prescription);
    onClose();
  };

  // Handle selection of exercise with variant
  const handleExerciseSelect = (selectedExercise: Exercise, variant?: ExerciseVariant) => {
    if (variant) {
      // If a variant was selected, use its prescription
      setPrescription({
        ...variant.prescription,
        groupId: group?.id || '',
        planIntervalId: intervalId || '',
        id: undefined // We'll get a new ID when saving
      });
    } else {
      // If just an exercise was selected without a variant
      setPrescription({
        ...prescription,
        exerciseId: selectedExercise.id,
        name: selectedExercise.name,
        groupId: group?.id || '',
        planIntervalId: intervalId || '',
      });
    }
    setActiveTab('new');
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
        {/* Header */}
        <DrawerHeader className="border-b px-4 py-4">
          <h2 className="text-xl font-semibold">Add Exercise</h2>
        </DrawerHeader>

        {/* Tabs */}
        <div className="border-b">
          <Tabs
            tabs={tabItems}
            activeTabId={activeTab}
            onTabChange={handleTabChange}
            equalWidth={true}
          />
        </div>

        {/* Content Area */}
        <DrawerBody className="flex-1 overflow-auto p-6">
          {activeTab === 'new' && (
            <NewExerciseTab
              exercise={exercise}
              parameterTypes={parameterTypes}
              prescription={prescription}
              onChange={setPrescription}
            />
          )}

          {activeTab === 'reuse' && (
            <ReuseExerciseTab
              exercises={allExercises}
              exerciseVariants={sampleExerciseVariants}
              parameterTypes={parameterTypes.length > 0 ? parameterTypes : sampleParameterTypes}
              onSelect={handleExerciseSelect}
            />
          )}
        </DrawerBody>

        {/* Footer with Action Buttons */}
        <DrawerFooter className="border-t p-4 bg-gray-50">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ExerciseSidebar;
