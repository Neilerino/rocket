import { useState, useRef, useEffect } from 'react';
import { Button } from 'shad/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from '@heroui/drawer';
import { ScrollArea } from 'shad/components/ui/scroll-area';
import { X as CloseIcon } from 'lucide-react';
import { Exercise, ParameterType, Group } from './types';
import NewExerciseTab from './new-exercise-tab';
import ReuseExerciseTab from './reuse-exercise-tab';
import { ExercisePrescription } from './types';

interface ExerciseSidebarProps {
  exercise?: Exercise;
  onClose: () => void;
  onSave?: (prescription: ExercisePrescription) => void;
  allExercises?: Exercise[];
  group: Group | null;
  intervalId: number | null;
  parameterTypes?: ParameterType[];
}

const ExerciseSidebar = ({
  exercise,
  onClose,
  onSave,
  allExercises = [],
  group,
  intervalId,
  parameterTypes = [],
}: ExerciseSidebarProps) => {
  console.log("ExerciseSidebar rendered with:", { exercise, group, intervalId });
  const [activeTab, setActiveTab] = useState<'new' | 'reuse'>('new');
  const [prescription, setPrescription] = useState<ExercisePrescription>({
    exerciseId: exercise?.id,
    groupId: group?.id || '',
    planIntervalId: intervalId?.toString() || '',
    sets: 3,
    rpe: 5,
    rest: '00:02:00', // 2 minutes default
    parameters: {},
  });

  // References for tabs and indicator
  const tabsRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    if (onSave) {
      onSave(prescription);
    }
    onClose();
  };

  const isDrawerOpen = !!exercise && !!group;
  console.log("Drawer open state:", isDrawerOpen, "Exercise:", exercise, "Group:", group);

  // Update indicator position when active tab changes
  useEffect(() => {
    if (!indicatorRef.current || !tabsRef.current) return;

    const indicator = indicatorRef.current;
    
    if (activeTab === 'new') {
      indicator.style.left = '0';
    } else {
      indicator.style.left = '50%';
    }
    
    indicator.style.opacity = '1';
  }, [activeTab]);

  return (
    <Drawer 
      isOpen={isDrawerOpen} 
      onClose={onClose}
      onOpenChange={(isOpen) => {
        console.log("Drawer onOpenChange:", isOpen);
        if (!isOpen) onClose();
      }}
      placement="right"
      size="lg"
    >
      <DrawerContent>
        <DrawerHeader>
          <h2 className="text-xl font-semibold">Add Exercise</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <CloseIcon className="h-4 w-4" />
          </Button>
        </DrawerHeader>
        
        <DrawerBody>
          {/* Custom tabs implementation - each tab gets 50% width */}
          <div className="border-b flex items-center justify-between bg-white mb-4">
            <div className="flex-grow relative">
              <div ref={tabsRef} className="grid grid-cols-2 relative">
                {/* New Exercise Tab */}
                <div
                  data-tab-id="new"
                  className={`px-4 py-2 cursor-pointer transition-colors text-center ${
                    activeTab === 'new'
                      ? 'font-medium text-primary'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab('new')}
                >
                  <span className="whitespace-nowrap">New Exercise</span>
                </div>

                {/* Reuse Exercise Tab */}
                <div
                  data-tab-id="reuse"
                  className={`px-4 py-2 cursor-pointer transition-colors text-center ${
                    activeTab === 'reuse'
                      ? 'font-medium text-primary'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab('reuse')}
                >
                  <span className="whitespace-nowrap">Reuse Exercise</span>
                </div>

                {/* Animated indicator - modified for even width tabs */}
                <div
                  ref={indicatorRef}
                  className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 opacity-0"
                  style={{ 
                    height: '2px', 
                    width: '50%',
                    left: '0'
                  }}
                />
              </div>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-250px)]">
            {/* Tab Content */}
            {activeTab === 'new' && (
              <div className="mt-0">
                <NewExerciseTab
                  prescription={prescription}
                  onChange={setPrescription}
                  parameterTypes={parameterTypes}
                />
              </div>
            )}

            {activeTab === 'reuse' && (
              <div className="mt-0">
                <ReuseExerciseTab
                  exercises={allExercises}
                  onSelect={(exercise) => {
                    setPrescription({
                      ...prescription,
                      exerciseId: exercise.id,
                    });
                    setActiveTab('new');
                  }}
                />
              </div>
            )}
          </ScrollArea>
        </DrawerBody>

        <DrawerFooter className="flex flex-row justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ExerciseSidebar;
