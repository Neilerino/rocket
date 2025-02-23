import { useState } from 'react';
import { Button } from 'shad/components/ui/button';
import { Sheet, SheetContent, SheetClose } from 'shad/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'shad/components/ui/tabs';
import { ScrollArea } from 'shad/components/ui/scroll-area';
import { X as CloseIcon } from 'lucide-react';
import { Exercise, ParameterType } from './types';
import NewExerciseTab from './new-exercise-tab';
import ReuseExerciseTab from './reuse-exercise-tab';
import { ExercisePrescription } from './types';

interface ExerciseSidebarProps {
  exercise?: Exercise;
  onClose: () => void;
  onSave: (prescription: ExercisePrescription) => void;
  allExercises?: Exercise[];
  groupId: string;
  planIntervalId: string;
  parameterTypes?: ParameterType[];
}

const ExerciseSidebar = ({
  exercise,
  onClose,
  onSave,
  allExercises = [],
  groupId,
  planIntervalId,
  parameterTypes = [],
}: ExerciseSidebarProps) => {
  const [activeTab, setActiveTab] = useState<'new' | 'reuse'>('new');
  const [prescription, setPrescription] = useState<ExercisePrescription>({
    exerciseId: exercise?.id,
    groupId,
    planIntervalId,
    sets: 3,
    rpe: 5,
    rest: '00:02:00', // 2 minutes default
    parameters: {},
  });

  if (!exercise) return null;

  return (
    <Sheet open={!!exercise} onOpenChange={onClose} modal={false}>
      <SheetContent
        side="left"
        className="w-[400px] sm:w-[540px] p-0 [&>button]:hidden"
        onWheel={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-lg font-semibold">Configure Exercise</h2>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => onClose()}>
                <CloseIcon className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>

          <ScrollArea className="flex-1">
            <div className="px-6 py-4">
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as 'new' | 'reuse')}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="new">New Exercise</TabsTrigger>
                  <TabsTrigger value="reuse">Reuse Exercise</TabsTrigger>
                </TabsList>
                <TabsContent value="new" className="space-y-4 mt-4">
                  <NewExerciseTab
                    exercise={exercise}
                    prescription={prescription}
                    setPrescription={setPrescription}
                    parameterTypes={parameterTypes}
                  />
                </TabsContent>
                <TabsContent value="reuse" className="mt-4">
                  <ReuseExerciseTab
                    exercises={allExercises}
                    currentExerciseId={exercise.id}
                    onSelectExercise={onSave}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>

          <div className="border-t p-6">
            <div className="flex justify-end gap-4">
              <SheetClose asChild>
                <Button variant="outline" onClick={() => onClose()}>
                  Cancel
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button onClick={() => onSave(prescription)}>Save</Button>
              </SheetClose>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ExerciseSidebar;
