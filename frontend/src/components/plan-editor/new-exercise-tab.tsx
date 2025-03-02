import { useState } from 'react';
import { Button } from 'shad/components/ui/button';
import { Input } from 'shad/components/ui/input';
import { Label } from 'shad/components/ui/label';
import { Textarea } from 'shad/components/ui/textarea';
import { Slider } from 'shad/components/ui/slider';
import { Exercise, ParameterType, ExercisePrescription } from './types';
import { ExerciseAccordion, AccordionItem } from './exercise-accordion';
import { Info, Clock, Repeat, Settings } from 'lucide-react';
import ParameterManager from './parameter-manager';

interface NewExerciseTabProps {
  exercise?: Exercise;
  parameterTypes?: ParameterType[];
  prescription?: ExercisePrescription;
  onChange?: (prescription: ExercisePrescription) => void;
}

const NewExerciseTab: React.FC<NewExerciseTabProps> = ({
  exercise,
  parameterTypes = [],
  prescription: externalPrescription,
  onChange,
}) => {
  // Create a default prescription if none is provided
  const defaultPrescription: ExercisePrescription = {
    id: '',
    exerciseId: exercise?.id || '',
    name: exercise?.name || '',
    sets: 3,
    reps: 10,
    parameters: {},
    lockedParameters: {},
  };

  // Use the provided prescription or the default
  const prescription = externalPrescription || defaultPrescription;

  // Local state for form fields
  const [hasReps, setHasReps] = useState(true);
  const [hasDuration, setHasDuration] = useState(false);
  const [description, setDescription] = useState(exercise?.description || '');

  // Handle prescription changes
  const handleChange = (updatedPrescription: ExercisePrescription) => {
    if (onChange) {
      onChange(updatedPrescription);
    }
  };

  // Handle name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange({
      ...prescription,
      name: e.target.value,
    });
  };

  // Handle sets change
  const handleSetsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange({
      ...prescription,
      sets: parseInt(e.target.value) || 0,
    });
  };

  // Handle reps change
  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange({
      ...prescription,
      reps: parseInt(e.target.value) || 0,
    });
  };

  // Format rest time from seconds to minutes and seconds
  const formatRestTime = (restSeconds?: string) => {
    if (!restSeconds) return { minutes: 0, seconds: 0 };
    
    const totalSeconds = parseInt(restSeconds) || 0;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return { minutes, seconds };
  };

  // Update rest time
  const updateRestTime = (minutes: string | number, seconds: string | number) => {
    const mins = parseInt(minutes.toString()) || 0;
    const secs = parseInt(seconds.toString()) || 0;
    const totalSeconds = (mins * 60) + secs;
    
    handleChange({
      ...prescription,
      rest: totalSeconds.toString(),
    });
  };

  // Handle parameter changes from the parameter manager
  const handleParameterChange = (
    parameters: Record<string, number>,
    lockedParameters: Record<string, number>
  ) => {
    handleChange({
      ...prescription,
      parameters,
      lockedParameters,
    });
  };

  const { minutes: restMinutes, seconds: restSeconds } = formatRestTime(prescription.rest);

  return (
    <div className="space-y-6">
      {/* Basic Information Section */}
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Exercise Name
        </label>
        <Input
          id="name"
          value={prescription.name || ''}
          onChange={handleNameChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="e.g. Campus Board Ladders"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <Textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Describe the exercise and how to perform it"
        />
      </div>

      {/* Sets and Repetitions */}
      <div className="space-y-4">
        <div className="flex items-center">
          <div className="mr-2 flex-shrink-0 text-gray-700">
            <Repeat className="h-5 w-5" />
          </div>
          <h3 className="text-base font-medium text-gray-900">Sets and Repetitions</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="sets" className="block text-sm font-medium text-gray-700">
              Number of Sets
            </label>
            <Input
              type="number"
              id="sets"
              min={1}
              value={prescription.sets || ''}
              onChange={handleSetsChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <AccordionItem value="reps" title="Repetitions" checked={hasReps} onCheckChange={setHasReps}>
            {hasReps && (
              <div className="space-y-2">
                <label htmlFor="reps" className="block text-sm font-medium text-gray-700">
                  Reps per Set
                </label>
                <Input
                  type="number"
                  id="reps"
                  min={1}
                  value={prescription.reps || ''}
                  onChange={handleRepsChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
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
              <div className="space-y-2">
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Active Time (minutes)
                </label>
                <Input
                  type="number"
                  id="duration"
                  min={0}
                  value={prescription.durationMinutes || ''}
                  onChange={(e) =>
                    handleChange({
                      ...prescription,
                      durationMinutes: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}
          </AccordionItem>
        </div>
      </div>

      {/* Rest and RPE Section */}
      <div className="space-y-4">
        <div className="flex items-center">
          <div className="mr-2 flex-shrink-0 text-gray-700">
            <Clock className="h-5 w-5" />
          </div>
          <h3 className="text-base font-medium text-gray-900">Rest and Intensity</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="rest" className="block text-sm font-medium text-gray-700">
              Rest Between Sets
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="rest-minutes" className="text-xs text-gray-500">
                  Minutes
                </label>
                <Input
                  type="number"
                  id="rest-minutes"
                  min={0}
                  value={restMinutes}
                  onChange={(e) => updateRestTime(e.target.value, restSeconds)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="rest-seconds" className="text-xs text-gray-500">
                  Seconds
                </label>
                <Input
                  type="number"
                  id="rest-seconds"
                  min={0}
                  max={59}
                  value={restSeconds}
                  onChange={(e) => updateRestTime(restMinutes, e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="rpe" className="text-sm font-medium text-gray-700">
              Rate of Perceived Exertion (RPE)
            </label>
            <div className="flex items-center">
              <span className="text-sm font-medium bg-primary-50 text-primary-700 py-0.5 px-1.5 rounded">
                {prescription.rpe?.toFixed(1) || 0}
              </span>
            </div>
          </div>
          <Slider
            value={[prescription.rpe || 0]}
            min={0}
            max={10}
            step={0.5}
            className="mt-2"
            onValueChange={([value]) =>
              handleChange({
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

      {/* Parameter Types Section - Now using our new ParameterManager component */}
      {parameterTypes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="mr-2 flex-shrink-0 text-gray-700">
              <Settings className="h-5 w-5" />
            </div>
            <h3 className="text-base font-medium text-gray-900">Exercise Parameters</h3>
          </div>

          <ParameterManager
            parameterTypes={parameterTypes}
            parameters={prescription.parameters || {}}
            lockedParameters={prescription.lockedParameters || {}}
            onChange={handleParameterChange}
          />
        </div>
      )}
    </div>
  );
};

export default NewExerciseTab;
