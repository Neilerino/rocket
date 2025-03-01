import { useState } from 'react';
import { Button } from 'shad/components/ui/button';
import { Input } from 'shad/components/ui/input';
import { Label } from 'shad/components/ui/label';
import { Textarea } from 'shad/components/ui/textarea';
import { Slider } from 'shad/components/ui/slider';
import { Exercise, ParameterType, ExercisePrescription } from './types';
import { ExerciseAccordion, AccordionItem } from './exercise-accordion';
import { Info, Clock, Repeat } from 'lucide-react';

interface NewExerciseTabProps {
  prescription: ExercisePrescription;
  onChange: (prescription: ExercisePrescription) => void;
  parameterTypes: ParameterType[];
}

const NewExerciseTab = ({
  prescription,
  onChange,
  parameterTypes,
}: NewExerciseTabProps) => {
  const [hasReps, setHasReps] = useState(true);
  const [hasDuration, setHasDuration] = useState(false);

  const formatRestTime = (timeString?: string) => {
    if (!timeString) return { minutes: '00', seconds: '00' };
    const parts = timeString.split(':');
    // Handle "00:01:30" format (hours:minutes:seconds)
    if (parts.length === 3) {
      return { minutes: parts[1], seconds: parts[2] };
    }
    // Fallback for unexpected format
    return { minutes: '00', seconds: '00' };
  };

  const updateRestTime = (minutes: string, seconds: string) => {
    const mins = minutes.padStart(2, '0');
    const secs = seconds.padStart(2, '0');
    onChange({
      ...prescription,
      rest: `00:${mins}:${secs}`,
    });
  };

  const { minutes: restMinutes, seconds: restSeconds } = formatRestTime(prescription.rest);

  return (
    <div className="space-y-6 pb-4">
      {/* Basic Information Section */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
          <Info className="h-4 w-4" />
          <span>Basic Information</span>
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-700">Exercise Name</Label>
            <Input
              id="name"
              value={prescription.name || ''}
              onChange={(e) => onChange({ ...prescription, name: e.target.value })}
              className="mt-1"
              placeholder="e.g. Campus Board Ladders"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-700">Description</Label>
            <Textarea
              id="description"
              value={prescription.description || ''}
              onChange={(e) =>
                onChange({
                  ...prescription,
                  description: e.target.value,
                })
              }
              className="mt-1"
              placeholder="Describe the exercise and how to perform it"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Sets and Reps Section */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
          <Repeat className="h-4 w-4" />
          <span>Sets and Repetitions</span>
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label className="text-gray-700">Number of Sets</Label>
            <Input
              type="number"
              value={prescription.sets || ''}
              onChange={(e) =>
                onChange({
                  ...prescription,
                  sets: parseInt(e.target.value) || 0,
                })
              }
              min={1}
              className="mt-1"
            />
          </div>

          <AccordionItem value="reps" title="Repetitions" checked={hasReps} onCheckChange={setHasReps}>
            {hasReps && (
              <div className="space-y-4 pt-2">
                <div>
                  <Label className="text-sm text-gray-600">Reps per Set</Label>
                  <Input
                    type="number"
                    value={prescription.reps || ''}
                    onChange={(e) =>
                      onChange({
                        ...prescription,
                        reps: parseInt(e.target.value) || 0,
                      })
                    }
                    min={1}
                    className="mt-1"
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
              <div className="space-y-4 pt-2">
                <div>
                  <Label className="text-sm text-gray-600">Active Time (minutes)</Label>
                  <Input
                    type="number"
                    value={prescription.durationMinutes || ''}
                    onChange={(e) =>
                      onChange({
                        ...prescription,
                        durationMinutes: parseInt(e.target.value) || 0,
                      })
                    }
                    min={0}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </AccordionItem>
        </div>
      </div>

      {/* Rest and RPE Section */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
          <Clock className="h-4 w-4" />
          <span>Rest and Intensity</span>
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label className="text-gray-700">Rest Between Sets</Label>
            <div className="flex gap-4 mt-1">
              <div className="flex-1">
                <Label className="text-xs text-gray-500">Minutes</Label>
                <Input
                  type="number"
                  value={restMinutes}
                  onChange={(e) => updateRestTime(e.target.value, restSeconds)}
                  min={0}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-gray-500">Seconds</Label>
                <Input
                  type="number"
                  value={restSeconds}
                  onChange={(e) => updateRestTime(restMinutes, e.target.value)}
                  min={0}
                  max={59}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label className="text-gray-700">Rate of Perceived Exertion (RPE)</Label>
              <span className="text-sm font-medium bg-primary-50 text-primary-700 py-0.5 px-1.5 rounded">
                {prescription.rpe?.toFixed(1) || 0}
              </span>
            </div>
            <Slider
              value={[prescription.rpe || 0]}
              min={0}
              max={10}
              step={0.5}
              className="mt-2"
              onValueChange={([value]) =>
                onChange({
                  ...prescription,
                  rpe: value,
                })
              }
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Easy</span>
              <span>Moderate</span>
              <span>Maximum</span>
            </div>
          </div>
        </div>
      </div>

      {/* Parameter Types Section */}
      {parameterTypes.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Custom Parameters</h3>
          
          <div className="space-y-4">
            {parameterTypes.map((param) => (
              <div key={param.id}>
                <Label className="text-gray-700">
                  {param.name} {param.defaultUnit && `(${param.defaultUnit})`}
                </Label>
                <Input
                  type="number"
                  value={prescription.parameters[param.id] || ''}
                  onChange={(e) => {
                    const newParams = { ...prescription.parameters };
                    newParams[param.id] = parseFloat(e.target.value) || 0;
                    onChange({
                      ...prescription,
                      parameters: newParams,
                    });
                  }}
                  className="mt-1"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewExerciseTab;
