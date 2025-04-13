import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { useEffect } from 'react';
import {
  useCreateExercise,
  useCreateExerciseVariation,
} from '@/services/hooks/exercises/useExerciseMutations';
import { useCreatePrescription } from '@/services/hooks/prescriptions/usePrescriptionMutations';

export const exerciseParameterSchema = z.object({
  parameterTypeId: z.number(),
  locked: z.boolean(),
});

export type ExerciseParameterFormData = z.infer<typeof exerciseParameterSchema>;

// Define the COMPLETE schema for form validation using Zod
const exerciseFormSchema = z.object({
  id: z.number().nullable(), // For editing existing prescription
  variationId: z.number().nullable(), // For reusing existing variation
  name: z.string().min(1, 'Exercise name cannot be empty.'),
  description: z.string().nullable(),
  sets: z.number().min(1, 'Sets must be at least 1'),
  reps: z.number().min(1, 'Reps must be at least 1'),
  restMinutes: z.number().min(0, 'Rest cannot be negative').nullable(),
  restSeconds: z.number().min(0, 'Rest cannot be negative').nullable(),
  rpe: z.number().min(0).max(10).nullable(),
  durationMinutes: z.number().min(0, 'Duration cannot be negative').nullable(),
  durationSeconds: z.number().min(0, 'Duration cannot be negative').nullable(),
  subReps: z.number().min(0, 'Sub-reps cannot be negative').nullable(),
  subWorkDurationMinutes: z.number().min(0, 'Sub-work duration cannot be negative').nullable(),
  subWorkDurationSeconds: z.number().min(0, 'Sub-work duration cannot be negative').nullable(),
  subRestDurationMinutes: z.number().min(0, 'Sub-rest duration cannot be negative').nullable(),
  subRestDurationSeconds: z.number().min(0, 'Sub-rest duration cannot be negative').nullable(),
  parameters: z.array(exerciseParameterSchema),
});

// Type for the form values based on the schema
export type ExerciseFormData = z.infer<typeof exerciseFormSchema>;

// Type for the props the hook will accept
interface UseExerciseFormProps {
  intervalId: number;
  groupId: number;
  initialValues?: Partial<ExerciseFormData>; // Optional initial values for the form
}

// Default values for a new form
export const defaultExerciseValues: ExerciseFormData = {
  id: null,
  variationId: null,
  name: '',
  description: '',
  sets: 3,
  reps: 10,
  restMinutes: null,
  restSeconds: null,
  rpe: 5.0,
  durationMinutes: null,
  durationSeconds: null,
  subReps: null,
  subWorkDurationMinutes: null,
  subWorkDurationSeconds: null,
  subRestDurationMinutes: null,
  subRestDurationSeconds: null,
  parameters: [],
};

const defaultFormValues = (initialValues: Partial<ExerciseFormData> | undefined) => {
  return {
    ...defaultExerciseValues,
    ...(initialValues && {
      ...initialValues,
      sets: initialValues.sets ?? defaultExerciseValues.sets,
      reps: initialValues.reps !== undefined ? initialValues.reps : defaultExerciseValues.reps,
      restMinutes:
        initialValues.restMinutes !== undefined
          ? initialValues.restMinutes
          : defaultExerciseValues.restMinutes,
      restSeconds:
        initialValues.restSeconds !== undefined
          ? initialValues.restSeconds
          : defaultExerciseValues.restSeconds,
      rpe: initialValues.rpe !== undefined ? initialValues.rpe : defaultExerciseValues.rpe,
      durationMinutes:
        initialValues.durationMinutes !== undefined
          ? initialValues.durationMinutes
          : defaultExerciseValues.durationMinutes,
      durationSeconds:
        initialValues.durationSeconds !== undefined
          ? initialValues.durationSeconds
          : defaultExerciseValues.durationSeconds,
      subReps: initialValues.subReps ?? defaultExerciseValues.subReps,
      subWorkDurationMinutes:
        initialValues.subWorkDurationMinutes !== undefined
          ? initialValues.subWorkDurationMinutes
          : defaultExerciseValues.subWorkDurationMinutes,
      subWorkDurationSeconds:
        initialValues.subWorkDurationSeconds !== undefined
          ? initialValues.subWorkDurationSeconds
          : defaultExerciseValues.subWorkDurationSeconds,
      subRestDurationMinutes:
        initialValues.subRestDurationMinutes !== undefined
          ? initialValues.subRestDurationMinutes
          : defaultExerciseValues.subRestDurationMinutes,
      subRestDurationSeconds:
        initialValues.subRestDurationSeconds !== undefined
          ? initialValues.subRestDurationSeconds
          : defaultExerciseValues.subRestDurationSeconds,
      parameters: initialValues.parameters ?? defaultExerciseValues.parameters,
    }),
  };
};

const handleDuration = (minutes: number, seconds: number) => {
  if (!minutes && !seconds) return null;
  if (!minutes) return `${seconds} seconds`;
  if (!seconds) return `${minutes} minutes`;
  return `${minutes} minutes ${seconds} seconds`;
};

export const useExerciseForm = ({ intervalId, groupId, initialValues }: UseExerciseFormProps) => {
  const { mutateAsync: createExercise } = useCreateExercise({
    intervalId,
  });
  const { mutateAsync: createPrescription } = useCreatePrescription();
  const { mutateAsync: createExerciseVariation } = useCreateExerciseVariation({ intervalId });

  const form = useForm({
    defaultValues: defaultFormValues(initialValues),
    validators: {
      onChange: exerciseFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        let variationId: number | null = null;
        if (value.variationId === null) {
          const newExercise = await createExercise({
            name: value.name,
            description: value.description ?? '',
            userId: 1,
          });
          const newVariation = await createExerciseVariation({
            exerciseId: newExercise.id,
            // description: value.description ?? '',
            parameterTypes:
              value.parameters?.map((p) => ({
                parameterTypeId: p.parameterTypeId,
                locked: p.locked,
              })) ?? [],
          });
          variationId = newVariation.id;
        } else {
          variationId = value.variationId;
        }

        await createPrescription({
          groupId: groupId,
          planIntervalId: intervalId,
          exerciseVariationId: variationId,
          sets: value.sets,
          reps: value.reps,
          rpe: value.rpe ? Math.round(value.rpe) : null,
          duration: handleDuration(value.durationMinutes ?? 0, value.durationSeconds ?? 0),
          rest: handleDuration(value.restMinutes ?? 0, value.restSeconds ?? 0),
          subReps: value.subReps,
          subWorkDuration: handleDuration(
            value.subWorkDurationMinutes ?? 0,
            value.subWorkDurationSeconds ?? 0,
          ),
          subRestDuration: handleDuration(
            value.subRestDurationMinutes ?? 0,
            value.subRestDurationSeconds ?? 0,
          ),
        });
      } catch (error) {
        console.error(error);
      }
    },
  });

  useEffect(() => {
    form.reset(defaultFormValues(initialValues));
  }, [initialValues, form]);

  return form;
};

export type ExerciseForm = ReturnType<typeof useExerciseForm>;
            reps: value.reps,
            rpe: value.rpe ? Math.round(value.rpe) : null,
            duration: handleDuration(value.durationMinutes ?? 0, value.durationSeconds ?? 0),
            rest: handleDuration(value.restMinutes ?? 0, value.restSeconds ?? 0),
            subReps: value.subReps,
            subWorkDuration: handleDuration(
              value.subWorkDurationMinutes ?? 0,
              value.subWorkDurationSeconds ?? 0,
            ),
            subRestDuration: handleDuration(
              value.subRestDurationMinutes ?? 0,
              value.subRestDurationSeconds ?? 0,
            ),
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
  });

  useEffect(() => {
    form.reset(defaultFormValues(initialValues));
  }, [initialValues, form]);

  return form;
};

export type ExerciseForm = ReturnType<typeof useExerciseForm>;
