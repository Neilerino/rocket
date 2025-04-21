import React from 'react';
import { Input } from 'shad/components/ui/input';
import { Label } from 'shad/components/ui/label';
import { Textarea } from 'shad/components/ui/textarea';
import { ExerciseForm } from './useExerciseForm';
import { CreateExerciseParameterTypeDto } from '@/services/types';
import ParameterManager from './parameter-manager';
import { Settings } from 'lucide-react';
import { Slider } from 'shad/components/ui/slider';
import { AnyFieldApi } from '@tanstack/react-form';
import {
  StopwatchInputGroup,
  StopwatchMinutesInput,
  StopwatchSecondsInput,
} from './stopwatchInput';
import ToggleFormHeader from '../ui/toggle-form-header';
import { useParameterTypes } from '@/services/hooks';

interface NewExerciseTabProps {
  form: ExerciseForm;
}

const FieldError = ({ field }: { field: AnyFieldApi }) => {
  if (field.state.meta.errors.length === 0) return;

  return <em className="text-sm text-destructive">{field.state.meta.errors.join(', ')}</em>;
};

const NewExerciseTab: React.FC<NewExerciseTabProps> = ({ form }) => {
  const { data: parameterTypes } = useParameterTypes({ userId: 1 });

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
              <>
                <ToggleFormHeader
                  title="Duration"
                  isToggled={durationMinutes !== null && durationSeconds !== null}
                  onToggle={(toggled: boolean) => {
                    form.setFieldValue('durationMinutes', toggled ? (durationMinutes ?? 5) : null);
                    form.setFieldValue('durationSeconds', toggled ? (durationSeconds ?? 0) : null);
                  }}
                />
                <StopwatchInputGroup id="duration">
                  <form.Field
                    name="durationMinutes"
                    children={(field) => (
                      <StopwatchMinutesInput
                        disabled={durationMinutes === null && durationSeconds === null}
                        value={field.state.value ?? 0}
                        onChange={(e) => field.setValue(parseInt(e.target.value, 10) || 0)}
                      />
                    )}
                  />
                  <form.Field
                    name="durationSeconds"
                    children={(field) => (
                      <StopwatchSecondsInput
                        disabled={durationMinutes === null && durationSeconds === null}
                        value={field.state.value ?? 0}
                        onChange={(e) => field.setValue(parseInt(e.target.value, 10) || 0)}
                      />
                    )}
                  />
                </StopwatchInputGroup>
              </>
            )}
          />
        </div>
      </div>

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
                <ToggleFormHeader
                  title="RPE (Rate of Perceived Exertion)"
                  isToggled={rpe !== null}
                  onToggle={(toggled: boolean) => form.setFieldValue('rpe', toggled ? 5 : null)}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium bg-primary-50 text-primary-700 py-0.5 px-1.5 rounded">
                      {rpe?.toFixed(0)}
                    </span>
                  </div>
                </div>
                <Slider
                  disabled={rpe === null}
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

      {/* Interval Training Section */}
      <div className="space-y-4">
        <form.Subscribe
          selector={(state) => ({
            subReps: state.values.subReps,
            subWorkDurationMinutes: state.values.subWorkDurationMinutes,
            subWorkDurationSeconds: state.values.subWorkDurationSeconds,
            subRestDurationMinutes: state.values.subRestDurationMinutes,
            subRestDurationSeconds: state.values.subRestDurationSeconds,
          })}
          children={({
            subReps,
            subWorkDurationMinutes,
            subWorkDurationSeconds,
            subRestDurationMinutes,
            subRestDurationSeconds,
          }) => {
            const isIntervalEnabled =
              subReps !== null ||
              subWorkDurationMinutes !== null ||
              subWorkDurationSeconds !== null ||
              subRestDurationMinutes !== null ||
              subRestDurationSeconds !== null;
            return (
              <>
                <ToggleFormHeader
                  title="Interval Training (e.g., Repeaters)"
                  isToggled={isIntervalEnabled}
                  onToggle={(toggled) => {
                    if (toggled) {
                      // Set defaults if enabling
                      form.setFieldValue('subReps', subReps ?? 1);
                      form.setFieldValue('subWorkDurationMinutes', subWorkDurationMinutes ?? 0);
                      form.setFieldValue('subWorkDurationSeconds', subWorkDurationSeconds ?? 7);
                      form.setFieldValue('subRestDurationMinutes', subRestDurationMinutes ?? 0);
                      form.setFieldValue('subRestDurationSeconds', subRestDurationSeconds ?? 3);
                    } else {
                      // Clear values if disabling
                      form.setFieldValue('subReps', null);
                      form.setFieldValue('subWorkDurationMinutes', null);
                      form.setFieldValue('subWorkDurationSeconds', null);
                      form.setFieldValue('subRestDurationMinutes', null);
                      form.setFieldValue('subRestDurationSeconds', null);
                    }
                  }}
                />
                {/* Sub Reps */}
                <div className="space-y-2">
                  <form.Field
                    name="subReps"
                    validators={{
                      onChange: ({ value }: { value: number | null | undefined }) =>
                        isIntervalEnabled && (value === null || value === undefined || value < 1)
                          ? 'Sub-reps must be at least 1.'
                          : undefined,
                    }}
                    children={(field) => (
                      <div className="space-y-1.5">
                        <Label htmlFor={field.name}>Reps per Interval (Sub-Reps)</Label>
                        <Input
                          type="number"
                          id={field.name}
                          name={field.name}
                          value={field.state.value ?? ''}
                          min={1}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(parseInt(e.target.value, 10) || 0)}
                          disabled={!isIntervalEnabled}
                          className={field.state.meta.errors.length ? 'border-destructive' : ''}
                        />
                        <FieldError field={field} />
                      </div>
                    )}
                  />
                </div>

                {/* Sub-Work Duration */}
                <StopwatchInputGroup id="subWorkDuration" label="Work Duration per Sub-Rep">
                  <form.Field
                    name="subWorkDurationMinutes"
                    children={(field) => (
                      <StopwatchMinutesInput
                        disabled={!isIntervalEnabled}
                        value={field.state.value ?? 0}
                        onChange={(e) => field.setValue(parseInt(e.target.value, 10) || 0)}
                      />
                    )}
                  />
                  <form.Field
                    name="subWorkDurationSeconds"
                    children={(field) => (
                      <StopwatchSecondsInput
                        disabled={!isIntervalEnabled}
                        value={field.state.value ?? 0}
                        onChange={(e) => field.setValue(parseInt(e.target.value, 10) || 0)}
                      />
                    )}
                  />
                </StopwatchInputGroup>

                {/* Sub-Rest Duration */}
                <StopwatchInputGroup id="subRestDuration" label="Rest Duration per Sub-Rep">
                  <form.Field
                    name="subRestDurationMinutes"
                    children={(field) => (
                      <StopwatchMinutesInput
                        disabled={!isIntervalEnabled}
                        value={field.state.value ?? 0}
                        onChange={(e) => field.setValue(parseInt(e.target.value, 10) || 0)}
                      />
                    )}
                  />
                  <form.Field
                    name="subRestDurationSeconds"
                    children={(field) => (
                      <StopwatchSecondsInput
                        disabled={!isIntervalEnabled}
                        value={field.state.value ?? 0}
                        onChange={(e) => field.setValue(parseInt(e.target.value, 10) || 0)}
                      />
                    )}
                  />
                </StopwatchInputGroup>
              </>
            );
          }}
        />
      </div>

      {/* Parameter Types Section - Now using our new ParameterManager component */}
      <form.Subscribe
        selector={(state) => state.values.parameters}
        children={(parameters) => (
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="mr-2 flex-shrink-0 text-gray-700">
                <Settings className="h-5 w-5" />
              </div>
              <h3 className="text-base font-medium text-gray-900">Exercise Parameters</h3>
            </div>

            <div className="space-y-1.5">
              <ParameterManager
                allParameterTypes={parameterTypes ?? []}
                selectedParameters={parameters}
                onParametersChange={(newParams: CreateExerciseParameterTypeDto[]) =>
                  form.setFieldValue('parameters', newParams)
                }
              />
              <form.Field name="parameters" children={(field) => <FieldError field={field} />} />
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default NewExerciseTab;
