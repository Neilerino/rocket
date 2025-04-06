import React from 'react';
import { Input } from 'shad/components/ui/input';
import { Label } from 'shad/components/ui/label';
import { Textarea } from 'shad/components/ui/textarea';
import { ExerciseParameterFormData, ExerciseForm } from './useExerciseForm';
import { ParameterType, CreateExerciseParameterTypeDto } from '@/services/types';
import { AccordionItem } from './exercise-accordion';
import ParameterManager from './parameter-manager';
import { Clock, Repeat, Settings } from 'lucide-react';
import { Slider } from 'shad/components/ui/slider';
import { AnyFieldApi } from '@tanstack/react-form';
import {
  StopwatchInputGroup,
  StopwatchMinutesInput,
  StopwatchSecondsInput,
} from './stopwatchInput';

interface NewExerciseTabProps {
  form: ExerciseForm;
  parameterTypes: ParameterType[];
}

const FieldError = ({ field }: { field: AnyFieldApi }) => {
  if (field.state.meta.errors.length === 0) return;

  return <em className="text-sm text-destructive">{field.state.meta.errors.join(', ')}</em>;
};

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
              <FieldError field={field} />
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
              <FieldError field={field} />
            </div>
          )}
        />
      </div>

      {/* Sets and Repetitions */}
      <div className="space-y-4">
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
                  <FieldError field={field} />
                </div>
              )}
            />
          </div>
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
                    value={field.state.value ?? ''}
                    min={1}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(parseInt(e.target.value, 10) || 0)}
                    className={field.state.meta.errors.length ? 'border-destructive' : ''}
                  />
                  <FieldError field={field} />
                </div>
              )}
            />
          </div>
          <form.Subscribe
            selector={(state) => ({
              durationMinutes: state.values.durationMinutes,
              durationSeconds: state.values.durationSeconds,
            })}
            children={({ durationMinutes, durationSeconds }) => (
              <AccordionItem
                value="duration"
                title="Duration"
                checked={durationMinutes !== null && durationSeconds !== null}
                onCheckChange={(checked: boolean) => {
                  form.setFieldValue('durationMinutes', checked ? (durationMinutes ?? 5) : null);
                  form.setFieldValue('durationSeconds', checked ? (durationSeconds ?? 0) : null);
                }}
              >
                <StopwatchInputGroup id="duration">
                  <form.Field
                    name="durationMinutes"
                    children={(field) => (
                      <StopwatchMinutesInput
                        value={field.state.value ?? 0}
                        onChange={(e) => field.setValue(parseInt(e.target.value, 10) || 0)}
                      />
                    )}
                  />
                  <form.Field
                    name="durationSeconds"
                    children={(field) => (
                      <StopwatchSecondsInput
                        value={field.state.value ?? 0}
                        onChange={(e) => field.setValue(parseInt(e.target.value, 10) || 0)}
                      />
                    )}
                  />
                </StopwatchInputGroup>
              </AccordionItem>
            )}
          />
        </div>
      </div>

      {/* Rest and RPE Section */}
      <div className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <form.Subscribe
              selector={(state) => ({
                restMinutes: state.values.restMinutes,
                restSeconds: state.values.restSeconds,
              })}
              children={({ restMinutes, restSeconds }) => (
                <StopwatchInputGroup id="rest" label="Rest Between Sets">
                  <form.Field
                    name="restMinutes"
                    children={(field) => (
                      <StopwatchMinutesInput
                        value={restMinutes ?? 0}
                        onChange={(e) => field.setValue(parseInt(e.target.value, 10) || 0)}
                      />
                    )}
                  />
                  <form.Field
                    name="restSeconds"
                    children={(field) => (
                      <StopwatchSecondsInput
                        value={restSeconds ?? 0}
                        onChange={(e) => field.setValue(parseInt(e.target.value, 10) || 0)}
                      />
                    )}
                  />
                </StopwatchInputGroup>
              )}
            />
          </div>
          <form.Subscribe
            selector={(state) => state.values.rpe}
            children={(rpe) => (
              <>
                <div className="flex items-center justify-between">
                  <Label htmlFor="rpe" className="text-sm font-medium text-gray-700">
                    RPE (Rate of Perceived Exertion)
                  </Label>
                  <div className="flex items-center">
                    <span className="text-sm font-medium bg-primary-50 text-primary-700 py-0.5 px-1.5 rounded">
                      {rpe?.toFixed(0)}
                    </span>
                  </div>
                </div>
                <Slider
                  value={[rpe ?? 5]}
                  min={0}
                  max={10}
                  step={0.1}
                  className="mt-2"
                  onValueChange={(value) => form.setFieldValue('rpe', value[0])}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Easy</span>
                  <span>Moderate</span>
                  <span>Maximum</span>
                </div>
              </>
            )}
          />
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
                <form.Field name="parameters" children={(field) => <FieldError field={field} />} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewExerciseTab;
