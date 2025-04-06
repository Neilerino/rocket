import React from 'react';
import { Input } from 'shad/components/ui/input';
import { Label } from 'shad/components/ui/label';
import { Textarea } from 'shad/components/ui/textarea';
import { ExerciseParameterFormData, ExerciseForm, ExerciseFormData } from './useExerciseForm';
import { ParameterType, CreateExerciseParameterTypeDto } from '@/services/types';
import { AccordionItem } from './exercise-accordion';
import ParameterManager from './parameter-manager';
import { Clock, Repeat, Settings } from 'lucide-react';
import { Slider } from 'shad/components/ui/slider';
import { FieldApi } from '@tanstack/react-form';

interface NewExerciseTabProps {
  form: ExerciseForm;
  parameterTypes: ParameterType[];
}

function FieldError({ errors }: { errors: string[] }) {
  if (!errors.length) return null;
  return <em className="text-sm text-destructive">{errors.join(', ')}</em>;
}

const NewExerciseTab: React.FC<NewExerciseTabProps> = ({ form, parameterTypes }) => {
  const formatRestTime = (totalSeconds: number | null | undefined) => {
    if (totalSeconds === null || totalSeconds === undefined || totalSeconds < 0)
      return { minutes: 0, seconds: 0 };
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return { minutes, seconds };
  };

  const { minutes: currentRestMinutes, seconds: currentRestSeconds } = formatRestTime(
    form.state.values.rest,
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }: { value: string }) =>
              !value ? 'Exercise name cannot be empty.' : undefined,
          }}
          children={(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name}>Exercise Name</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="E.g., Barbell Bench Press, Hangboard 20mm Repeater"
                className={field.state.meta.errors.length ? 'border-destructive' : ''}
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <form.Field
          name="description"
          children={(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name}>Description (Optional)</Label>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value ?? ''}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Description of the selected exercise"
              />
              {/* No error display needed for optional field? */}
              {/* <FieldError errors={field.state.meta.errors} /> */}
            </div>
          )}
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
            <form.Field
              name="sets"
              validators={{
                onChange: ({ value }: { value: number | null | undefined }) =>
                  value === null || value === undefined || value < 1
                    ? 'Sets must be at least 1.'
                    : undefined,
              }}
              children={(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Number of Sets</Label>
                  <Input
                    type="number"
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ''}
                    min={1}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(parseInt(e.target.value, 10) || 0)}
                    className={field.state.meta.errors.length ? 'border-destructive' : ''}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            />
          </div>
          <AccordionItem
            value="reps"
            title="Repetitions"
            checked={form.state.values.reps !== null}
            onCheckChange={(checked: boolean) => {
              form.setFieldValue('reps', checked ? (form.state.values.reps ?? 10) : null);
            }}
          >
            {form.state.values.reps !== null && (
              <div className="space-y-2">
                <form.Field
                  name="reps"
                  validators={{
                    onChange: ({ value }: { value: number | null | undefined }) =>
                      form.state.values.reps !== null &&
                      (value === null || value === undefined || value < 1)
                        ? 'Reps must be at least 1.'
                        : undefined,
                  }}
                  children={(field) => (
                    <div className="space-y-1.5">
                      <Label htmlFor={field.name}>Reps per Set</Label>
                      <Input
                        type="number"
                        id={field.name}
                        name={field.name}
                        value={field.state.value ?? ''} // Handle null
                        min={1}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(parseInt(e.target.value, 10) || 0)}
                        className={field.state.meta.errors.length ? 'border-destructive' : ''}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </div>
                  )}
                />
              </div>
            )}
          </AccordionItem>

          <AccordionItem
            value="duration"
            title="Duration"
            checked={form.state.values.duration !== null}
            onCheckChange={(checked: boolean) => {
              form.setFieldValue('duration', checked ? (form.state.values.duration ?? 5) : null);
            }}
          >
            {form.state.values.duration !== null && (
              <div className="space-y-2">
                <form.Field
                  name="duration"
                  validators={{
                    onChange: ({ value }: { value: number | null | undefined }) =>
                      form.state.values.duration !== null &&
                      (value === null || value === undefined || value < 0)
                        ? 'Duration cannot be negative.'
                        : undefined,
                  }}
                  children={(field) => (
                    <div className="space-y-1.5">
                      <Label htmlFor={field.name}>Active Time (minutes)</Label>
                      <Input
                        type="number"
                        id={field.name}
                        name={field.name}
                        value={field.state.value ?? ''} // Handle null
                        min={0}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(parseInt(e.target.value, 10) || 0)}
                        className={field.state.meta.errors.length ? 'border-destructive' : ''}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </div>
                  )}
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
            <form.Field
              name="rest"
              validators={{
                onChange: ({ value }: { value: number | null | undefined }) =>
                  value === null || value === undefined || value < 0
                    ? 'Rest time cannot be negative.'
                    : undefined,
              }}
              children={(field) => (
                <div className="space-y-1.5">
                  <Label>Rest Between Sets</Label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="rest-minutes" className="text-xs text-gray-500">
                        Minutes
                      </Label>
                      <Input
                        type="number"
                        id="rest-minutes"
                        min={0}
                        value={currentRestMinutes}
                        onBlur={field.handleBlur} // Trigger validation on blur
                        onChange={(e) => {
                          const mins = parseInt(e.target.value, 10) || 0;
                          field.handleChange(mins * 60 + currentRestSeconds);
                        }}
                        className={field.state.meta.errors.length ? 'border-destructive' : ''} // Show error state on both?
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="rest-seconds" className="text-xs text-gray-500">
                        Seconds
                      </Label>
                      <Input
                        type="number"
                        id="rest-seconds"
                        min={0}
                        max={59}
                        step={5} // Suggest steps for seconds
                        value={currentRestSeconds}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const secs = parseInt(e.target.value, 10) || 0;
                          field.handleChange(currentRestMinutes * 60 + Math.min(secs, 59)); // Ensure seconds don't exceed 59
                        }}
                        className={field.state.meta.errors.length ? 'border-destructive' : ''}
                      />
                    </div>
                  </div>
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="rpe" className="text-sm font-medium text-gray-700">
              RPE (Rate of Perceived Exertion)
            </Label>
            <div className="flex items-center">
              <span className="text-sm font-medium bg-primary-50 text-primary-700 py-0.5 px-1.5 rounded">
                {form.state.values.rpe?.toFixed(1)}
              </span>
            </div>
          </div>
          <Slider
            value={[form.state.values.rpe ?? 7]}
            min={0}
            max={10}
            step={0.5}
            className="mt-2"
            onValueChange={(value) => form.setFieldValue('rpe', value[0])}
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

          <div className="space-y-1.5">
            {form.state.values.parameters && (
              <>
                <ParameterManager
                  allParameterTypes={parameterTypes}
                  parameters={form.state.values.parameters?.map((p) => ({
                    parameterTypeId: p.parameterTypeId,
                    locked: p.locked,
                  }))}
                  onParametersChange={(newParams: CreateExerciseParameterTypeDto[]) => {
                    if (
                      !newParams ||
                      newParams.length === 0 ||
                      newParams[0].parameterTypeId === undefined
                    )
                      return;
                    const mappedParams: ExerciseParameterFormData[] = newParams.map((p) => ({
                      parameterTypeId: p.parameterTypeId,
                      locked: p.locked,
                    }));
                    form.setFieldValue('parameters', mappedParams);
                  }}
                />
                <form.Field
                  name="parameters"
                  children={(field) => <FieldError errors={field.state.meta.errors} />}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewExerciseTab;
