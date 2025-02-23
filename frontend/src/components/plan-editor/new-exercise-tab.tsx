import { useState } from 'react';
import { Button } from 'shad/components/ui/button';
import { Input } from 'shad/components/ui/input';
import { Label } from 'shad/components/ui/label';
import { Textarea } from 'shad/components/ui/textarea';
import { Slider } from 'shad/components/ui/slider';
import { Exercise, ParameterType } from './types';
import { ExerciseAccordion, AccordionItem } from './exercise-accordion';

interface ExercisePrescription {
  exerciseId?: number;
  name?: string;
  description?: string;
  rpe?: number;
  sets: number;
  reps?: number;
  durationMinutes?: number;
  durationSeconds?: number;
  rest?: string;
  parameters: Record<string, number>;
}

interface NewExerciseTabProps {
  exercise: Exercise;
  prescription: ExercisePrescription;
  setPrescription: (prescription: ExercisePrescription) => void;
  parameterTypes: ParameterType[];
}

const NewExerciseTab = ({
  exercise,
  prescription,
  setPrescription,
  parameterTypes,
}: NewExerciseTabProps) => {
  const [hasReps, setHasReps] = useState(true);
  const [hasDuration, setHasDuration] = useState(false);

  const formatRestTime = (timeString?: string) => {
    if (!timeString) return { minutes: '', seconds: '' };
    const [, minutes, seconds] = timeString.split(':');
    return { minutes, seconds };
  };

  const updateRestTime = (minutes: string, seconds: string) => {
    const mins = minutes.padStart(2, '0');
    const secs = seconds.padStart(2, '0');
    setPrescription({
      ...prescription,
      rest: `00:${mins}:${secs}`,
    });
  };

  const { minutes: restMinutes, seconds: restSeconds } = formatRestTime(prescription.rest);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={prescription.name || exercise?.name || ''}
          onChange={(e) => setPrescription({ ...prescription, name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={prescription.description || exercise?.description || ''}
          onChange={(e) =>
            setPrescription({
              ...prescription,
              description: e.target.value,
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Number of Sets</Label>
        <Input
          type="number"
          value={prescription.sets || ''}
          onChange={(e) =>
            setPrescription({
              ...prescription,
              sets: parseInt(e.target.value),
            })
          }
          min={1}
        />
      </div>

      <AccordionItem value="reps" title="Repetitions" checked={hasReps} onCheckChange={setHasReps}>
        {hasReps && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Reps per Set</Label>
              <Input
                type="number"
                value={prescription.reps || ''}
                onChange={(e) =>
                  setPrescription({
                    ...prescription,
                    reps: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>
        )}
      </AccordionItem>

      <AccordionItem
        value="duration"
        title="Duration"
        checked={hasDuration}
        onCheckChange={setHasDuration}
      >
        {hasDuration && (
          <div className="space-y-4">
            <div className="flex-1 space-y-2">
              <Label className="text-sm text-muted-foreground">Active Time</Label>
              <Input
                type="number"
                value={prescription.durationMinutes || ''}
                onChange={(e) =>
                  setPrescription({
                    ...prescription,
                    durationMinutes: parseInt(e.target.value),
                  })
                }
                min={0}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label className="text-sm text-muted-foreground">Rest Interval</Label>
              <Input
                type="number"
                value={prescription.restIntervalSeconds || ''}
                onChange={(e) =>
                  setPrescription({
                    ...prescription,
                    restIntervalSeconds: parseInt(e.target.value),
                  })
                }
                min={0}
                max={59}
              />
            </div>
          </div>
        )}
      </AccordionItem>

      <div className="space-y-2">
        <Label>Rest Between Sets</Label>
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <Label className="text-sm text-muted-foreground">Minutes</Label>
            <Input
              type="number"
              value={restMinutes}
              onChange={(e) => updateRestTime(e.target.value, restSeconds)}
              min={0}
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label className="text-sm text-muted-foreground">Seconds</Label>
            <Input
              type="number"
              value={restSeconds}
              onChange={(e) => updateRestTime(restMinutes, e.target.value)}
              min={0}
              max={59}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>RPE</Label>
          <span className="text-sm text-muted-foreground">{Math.round(prescription.rpe || 0)}</span>
        </div>
        <Slider
          value={[prescription.rpe || 0]}
          min={0}
          max={10}
          step={0.1}
          onValueChange={([value]) =>
            setPrescription({
              ...prescription,
              rpe: value,
            })
          }
          onValueCommit={([value]) =>
            setPrescription({
              ...prescription,
              rpe: Math.round(value),
            })
          }
        />
      </div>
    </div>
  );
};

export default NewExerciseTab;
