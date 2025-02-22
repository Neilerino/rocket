import { useState } from 'react';
import { Button } from 'shad/components/ui/button';
import { Input } from 'shad/components/ui/input';
import { Label } from 'shad/components/ui/label';
import { Sheet, SheetContent, SheetClose } from 'shad/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'shad/components/ui/tabs';
import { Textarea } from 'shad/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'shad/components/ui/select';
import { Slider } from 'shad/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from 'shad/components/ui/accordion';
import { ScrollArea } from 'shad/components/ui/scroll-area';
import { X as CloseIcon } from 'lucide-react';
import { Exercise, ParameterType } from './types';

interface ExercisePrescription {
  id?: string;
  exerciseId: string;
  groupId: string;
  planIntervalId: string;
  rpe?: number;
  sets: number;
  reps?: number;
  duration?: string; // interval
  rest?: string; // interval
  parameters: Record<string, number>; // parameter_type_id -> value
}

interface ExerciseSidebarProps {
  exercise: Exercise | null;
  onClose: () => void;
  onSave: (prescription: ExercisePrescription) => void;
  allExercises?: Exercise[];
  groupId: string;
  planIntervalId: string;
  parameterTypes: ParameterType[];
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
    exerciseId: exercise?.id || '',
    groupId,
    planIntervalId,
    sets: 3,
    reps: 10,
    rest: '00:02:00', // 2 minutes default
    parameters: {},
  });

  const availableExercises = allExercises.filter((e) => e.id !== exercise?.id);

  if (!exercise) return null;

  const handlePrescriptionChange = (field: keyof ExercisePrescription, value: any) => {
    setPrescription(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleParameterChange = (parameterId: string, value: number) => {
    setPrescription(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [parameterId]: value,
      },
    }));
  };

  const ExerciseForm = () => (
    <div className="space-y-6">
      {/* Basic Exercise Info */}
      <div className="space-y-4">
        <div>
          <Label>Exercise Name</Label>
          <Input
            value={exercise.name}
            disabled
            className="mt-1"
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={exercise.description}
            disabled
            className="mt-1"
          />
        </div>
      </div>

      {/* Exercise Configuration */}
      <div className="space-y-4">
        <div>
          <Label>Sets</Label>
          <Input
            type="number"
            value={prescription.sets}
            onChange={(e) => handlePrescriptionChange('sets', parseInt(e.target.value))}
            className="mt-1"
            min={1}
          />
        </div>

        <Accordion type="multiple" value={[
          prescription.reps !== undefined ? 'reps' : '',
          prescription.duration !== undefined ? 'duration' : ''
        ]}>
          <AccordionItem value="reps">
            <div className="flex items-center space-x-2 py-4">
              <input
                type="checkbox"
                id="useReps"
                checked={prescription.reps !== undefined}
                onChange={(e) => {
                  if (e.target.checked) {
                    setPrescription(prev => ({
                      ...prev,
                      reps: 10 // Default 10 reps
                    }));
                  } else {
                    setPrescription(prev => ({
                      ...prev,
                      reps: undefined
                    }));
                  }
                }}
                className="h-4 w-4 rounded border-gray-300"
              />
              <AccordionTrigger className="hover:no-underline">
                <Label htmlFor="useReps" className="cursor-pointer">Repetitions</Label>
              </AccordionTrigger>
            </div>
            <AccordionContent>
              <div className="space-y-4 pt-2 pb-4">
                <div>
                  <Label>Reps per Set</Label>
                  <Input
                    type="number"
                    value={prescription.reps}
                    onChange={(e) => handlePrescriptionChange('reps', parseInt(e.target.value))}
                    className="mt-1"
                    min={1}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="duration">
            <div className="flex items-center space-x-2 py-4">
              <input
                type="checkbox"
                id="useDuration"
                checked={prescription.duration !== undefined}
                onChange={(e) => {
                  if (e.target.checked) {
                    setPrescription(prev => ({
                      ...prev,
                      duration: '00:00:07' // Default 7 seconds for hangboard
                    }));
                  } else {
                    setPrescription(prev => ({
                      ...prev,
                      duration: undefined
                    }));
                  }
                }}
                className="h-4 w-4 rounded border-gray-300"
              />
              <AccordionTrigger className="hover:no-underline">
                <Label htmlFor="useDuration" className="cursor-pointer">Duration</Label>
              </AccordionTrigger>
            </div>
            <AccordionContent>
              <div className="space-y-4 pt-2 pb-4">
                <div>
                  <Label>Duration per Rep (mm:ss)</Label>
                  <Input
                    type="text"
                    value={prescription.duration?.split(':').slice(1).join(':')}
                    onChange={(e) => {
                      const [minutes, seconds] = e.target.value.split(':').map(Number);
                      const interval = `00:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                      handlePrescriptionChange('duration', interval);
                    }}
                    placeholder="00:07"
                    className="mt-1"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div>
          <Label>Rest Between Reps (mm:ss)</Label>
          <Input
            type="text"
            value={prescription.rest?.split(':').slice(1).join(':')}
            onChange={(e) => {
              const [minutes, seconds] = e.target.value.split(':').map(Number);
              const interval = `00:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
              handlePrescriptionChange('rest', interval);
            }}
            placeholder="00:03"
            className="mt-1"
          />
        </div>

        {/* Exercise Parameters */}
        {parameterTypes.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">Parameters</h3>
            <div className="grid grid-cols-2 gap-4">
              {parameterTypes.map((param) => (
                <div key={param.id}>
                  <Label>{param.name} ({param.defaultUnit})</Label>
                  <Input
                    type="number"
                    value={prescription.parameters[param.id] || ''}
                    onChange={(e) => handleParameterChange(param.id, parseFloat(e.target.value))}
                    className="mt-1"
                    min={param.minValue}
                    max={param.maxValue}
                    step="any"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <Label>Rate of Perceived Exertion (RPE)</Label>
            <span className="text-sm text-muted-foreground">{prescription.rpe || 0}</span>
          </div>
          <Slider
            value={[prescription.rpe || 0]}
            onValueChange={([value]) => handlePrescriptionChange('rpe', value)}
            className="mt-2"
            min={0}
            max={10}
            step={1}
          />
        </div>
      </div>
    </div>
  );

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
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0"
                onClick={() => onClose()}
              >
                <CloseIcon className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>

          <ScrollArea className="flex-1">
            <div className="px-6 py-4">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'new' | 'reuse')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="new">New Exercise</TabsTrigger>
                  <TabsTrigger value="reuse">Reuse Exercise</TabsTrigger>
                </TabsList>
                <TabsContent value="new" className="space-y-4 mt-4">
                  <ExerciseForm />
                </TabsContent>
                <TabsContent value="reuse" className="mt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {allExercises.map((e) => (
                        <div
                          key={e.id}
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div>
                            <h3 className="font-medium">{e.name}</h3>
                            {e.description && (
                              <p className="text-sm text-muted-foreground">
                                {e.description}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              onSave({
                                ...prescription,
                                exerciseId: e.id,
                              });
                            }}
                          >
                            Use
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
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
