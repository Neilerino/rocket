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
  id: z.number().optional(), // For editing existing prescription
  variationId: z.number().optional(), // For reusing existing variation
  name: z.string().min(1, 'Exercise name cannot be empty.'),
  description: z.string().optional(),
  sets: z.number().min(1, 'Sets must be at least 1'),
  reps: z.number().min(1, 'Reps must be at least 1'),
  rest: z.number().min(0, 'Rest cannot be negative').optional(), // Rest in seconds
  rpe: z.number().min(0).max(10).optional(),
  duration: z.number().min(0, 'Duration cannot be negative').optional(),
  parameters: z.array(exerciseParameterSchema).optional(),
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
  id: undefined,
  variationId: undefined,
  name: '',
  description: '',
  sets: 3,
  reps: 10,
  rest: 60,
  rpe: 7.0,
  duration: undefined,
  parameters: [],
};

const defaultFormValues = (initialValues: Partial<ExerciseFormData> | undefined) => {
  return {
    ...defaultExerciseValues,
    ...(initialValues && {
      ...initialValues,
      sets: initialValues.sets ?? defaultExerciseValues.sets,
      reps: initialValues.reps !== undefined ? initialValues.reps : defaultExerciseValues.reps,
      rest: initialValues.rest !== undefined ? initialValues.rest : defaultExerciseValues.rest,
      rpe: initialValues.rpe !== undefined ? initialValues.rpe : defaultExerciseValues.rpe,
      duration:
        initialValues.duration !== undefined
          ? initialValues.duration
          : defaultExerciseValues.duration,
      parameters: initialValues.parameters ?? defaultExerciseValues.parameters,
    }),
  };
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
        if (value.variationId === undefined) {
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

          await createPrescription({
            groupId: groupId,
            planIntervalId: intervalId,
            exerciseVariationId: newVariation.id,
            sets: value.sets,
            reps: value.reps,
            duration: value.duration ?? null,
            rest: value.rest ?? null,
          });
        } else {
          await createPrescription({
            groupId: groupId,
            planIntervalId: intervalId,
            exerciseVariationId: value.variationId,
            sets: value.sets,
            reps: value.reps,
            duration: value.duration ?? null,
            rest: value.rest ?? null,
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
  });

  // Reset form when initialValues change (e.g., editing a different item)
  useEffect(() => {
    form.reset(defaultFormValues(initialValues));
  }, [initialValues, form]);

  return form;
};

export type ExerciseForm = ReturnType<typeof useExerciseForm>;
