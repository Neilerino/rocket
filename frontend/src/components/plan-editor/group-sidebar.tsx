import { Button } from 'shad/components/ui/button';
import { Input } from 'shad/components/ui/input';
import { Label } from 'shad/components/ui/label';
import { Sheet, SheetContent } from 'shad/components/ui/sheet';
import { X as CloseIcon } from 'lucide-react';
import { Group } from './types';

interface GroupSidebarProps {
  group: Group | null;
  onClose: () => void;
}

const GroupSidebar = ({ group, onClose }: GroupSidebarProps) => {
  if (!group) return null;

  return (
    <Sheet open={!!group} onOpenChange={() => onClose()}>
      <SheetContent className="w-96 pt-12 p-0 bg-background border-l-4 border-l-gray-300 shadow-2xl">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{group.name}</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <CloseIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Group Name</Label>
                <Input value={group.name} className="mt-1" />
              </div>
              <div>
                <Label>Frequency</Label>
                <Input value={group.frequency} className="mt-1" />
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Exercises</h3>
              <Button variant="outline" size="sm">
                Add Exercise
              </Button>
            </div>
            <div className="space-y-3">
              {group.exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="border border-border rounded-lg p-4 hover:border-border/80 transition-colors bg-card"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{exercise.name}</h4>
                      <div className="text-sm text-muted-foreground mt-1">
                        <div>Sets: {exercise.sets}</div>
                        <div>RPE: {exercise.rpe}</div>
                        <div>Reps: {exercise.reps}</div>
                        <div>Rest: {exercise.rest}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <CloseIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default GroupSidebar;
