import React from 'react';
import { Input } from 'shad/components/ui/input';
import { Textarea } from 'shad/components/ui/textarea';
import { ExerciseFormData } from './exercise-sidebar';
import { Exercise as ServiceExercise, ParameterType } from '@/services/types';
import ExerciseSelection from './exercise-selection';
import { AccordionItem } from './exercise-accordion';
import ParameterManager from './parameter-manager';
import { Clock, Repeat, Settings } from 'lucide-react';
import { Slider } from 'shad/components/ui/slider';

interface NewExerciseTabProps {
  formData: ExerciseFormData;
  onFormChange: <K extends keyof ExerciseFormData>(field: K, value: ExerciseFormData[K]) => void;
  allExercises: ServiceExercise[];
  parameterTypes: ParameterType[];
}

const NewExerciseTab: React.FC<NewExerciseTabProps> = ({
  formData,
  onFormChange,
  allExercises,
  parameterTypes,
}) => {
  const handleChange = <K extends keyof ExerciseFormData>(field: K, value: ExerciseFormData[K]) => {
    onFormChange(field, value);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange('name', e.target.value);
  };

  const handleSetsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? null : parseInt(e.target.value, 10);
    if (value === null || !isNaN(value)) {
      handleChange('sets', value);
    }
  };

  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? null : parseInt(e.target.value, 10);
    if (value === null || !isNaN(value)) {
      handleChange('reps', value);
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? null : parseInt(e.target.value, 10);
    if (value === null || !isNaN(value)) {
      handleChange('durationMinutes', value);
    }
  };

  const formatRestTime = (restSeconds?: number | null) => {
    if (restSeconds === null || restSeconds === undefined) return { minutes: 0, seconds: 0 };

    const totalSeconds = restSeconds;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return { minutes, seconds };
  };

  const updateRestTime = (minutes: string | number, seconds: string | number) => {
    const mins = parseInt(minutes.toString()) || 0;
    const secs = parseInt(seconds.toString()) || 0;
    const totalSeconds = mins * 60 + secs;

    handleChange('rest', totalSeconds > 0 ? totalSeconds : null);
  };

  const handleParameterChange = (
    parameters: Record<string, number>,
    lockedParameters: Record<string, number>,
  ) => {
    onFormChange('parameters', parameters);
    const lockedParamsAsBooleans: Record<string, boolean> = Object.entries(lockedParameters).reduce(
      (acc, [key, value]) => {
        acc[key] = value === 1;
        return acc;
      },
      {} as Record<string, boolean>,
    );
    onFormChange('lockedParameters', lockedParamsAsBooleans);
  };

  const { minutes: restMinutes, seconds: restSeconds } = formatRestTime(formData.rest);
  const exerciseDescription = formData.exercise?.description || '';
  const currentSets = formData.sets ?? '';
  const currentReps = formData.reps ?? '';
  const currentDuration = formData.durationMinutes ?? '';
  const currentRpe = formData.rpe ?? 0;

  const lockedParamsAsNumbers: Record<string, number> = Object.entries(
    formData.lockedParameters,
  ).reduce(
    (acc, [key, value]) => {
      acc[key] = value ? 1 : 0;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-6">
      {/* Basic Information Section */}
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Exercise Name
        </label>
        <Input
          id="name"
          value={formData.name || ''}
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
          value={exerciseDescription}
          readOnly
          className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 focus:outline-none"
          placeholder="Description of the selected exercise"
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
              value={currentSets}
              onChange={handleSetsChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <ExerciseSelection
            value={formData.exercise}
            exercises={allExercises}
            onChange={(exercise: ServiceExercise | null) => handleChange('exercise', exercise)}
          />

          <AccordionItem
            value="reps"
            title="Repetitions"
            checked={formData.reps !== null && formData.reps !== undefined}
            onCheckChange={(checked: boolean) => {
              handleChange('reps', checked ? (formData.reps ?? 1) : null);
            }}
          >
            {formData.reps !== null && formData.reps !== undefined && (
              <div className="space-y-2">
                <label htmlFor="reps" className="block text-sm font-medium text-gray-700">
                  Reps per Set
                </label>
                <Input
                  type="number"
                  id="reps"
                  min={1}
                  value={currentReps}
                  onChange={handleRepsChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}
          </AccordionItem>

          <AccordionItem
            value="duration"
            title="Duration"
            checked={formData.durationMinutes !== null && formData.durationMinutes !== undefined}
            onCheckChange={(checked: boolean) => {
              handleChange('durationMinutes', checked ? (formData.durationMinutes ?? 1) : null);
            }}
          >
            {formData.durationMinutes !== null && formData.durationMinutes !== undefined && (
              <div className="space-y-2">
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Active Time (minutes)
                </label>
                <Input
                  type="number"
                  id="duration"
                  min={0}
                  value={currentDuration}
                  onChange={handleDurationChange}
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
              RPE (Rate of Perceived Exertion)
            </label>
            <div className="flex items-center">
              <span className="text-sm font-medium bg-primary-50 text-primary-700 py-0.5 px-1.5 rounded">
                {currentRpe.toFixed(1)}
              </span>
            </div>
          </div>
          <Slider
            value={[currentRpe]}
            min={0}
            max={10}
            step={0.5}
            className="mt-2"
            onValueChange={([value]) => handleChange('rpe', value)}
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
            parameters={formData.parameters}
            lockedParameters={lockedParamsAsNumbers}
            onChange={handleParameterChange}
          />
        </div>
      )}
    </div>
  );
};

export default NewExerciseTab;
