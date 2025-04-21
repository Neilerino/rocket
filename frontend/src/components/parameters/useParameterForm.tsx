import { useForm } from '@tanstack/react-form';
import { z } from 'zod';

export const exerciseParameterSchema = z
  .object({
    parameterTypeId: z.number().nullable(),
    name: z.string(),
    dataType: z.string(),
    defaultUnit: z.string(),
    minValue: z.number().nullable(),
    maxValue: z.number().nullable(),
    locked: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.parameterTypeId === null) {
      if (!data.name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Name is required when creating a new parameter type.',
          path: ['name'],
        });
      }
      if (!data.dataType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Data type is required when creating a new parameter type.',
          path: ['dataType'],
        });
      }
    }
  });

export type ExerciseParameterFormData = z.infer<typeof exerciseParameterSchema>;

const defaultFormValues = (
  initialValues: Partial<ExerciseParameterFormData> | undefined = undefined,
) => {
  return {
    parameterTypeId: null,
    name: '',
    dataType: '',
    defaultUnit: '',
    minValue: null,
    maxValue: null,
    locked: false,
    ...(initialValues || {}),
  };
};

export const useParameterForm = (onSubmit: (data: ExerciseParameterFormData) => void) => {
  const form = useForm({
    defaultValues: defaultFormValues(),
    validators: {
      onChange: exerciseParameterSchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  return form;
};
