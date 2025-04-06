import {
  ExerciseVariation,
  IntervalExercisePrescription,
  ExerciseVariationParam,
} from '@/services/types';
import { ExerciseFormData, ExerciseParameterFormData, defaultExerciseValues } from './useExerciseForm';

/**
 * Maps an ExerciseVariation (typically used for reusing exercises) to the ExerciseFormData structure.
 * Ensures IDs are converted to strings for form compatibility.
 */
export function mapVariationToFormData(
  variation: ExerciseVariation
): ExerciseFormData {
  // Map ExerciseVariationParam to ExerciseParameterFormData
  const parameters: ExerciseParameterFormData[] = (variation.parameters || []).map(
    (pt: ExerciseVariationParam) => ({
      parameterTypeId: pt.parameterTypeId,
      locked: pt.locked,
    }),
  );

  return {
    id: undefined, // Match schema (number | undefined)
    variationId: variation.id,
    // Use description from the base exercise
    name: variation.exercise?.name ?? '',
    description: variation.exercise?.description ?? '',
    sets: 1, // Default values for prescription fields
    reps: 10,
    rest: 60,
    rpe: undefined,
    duration: undefined,
    parameters,
  };
}

/**
 * Maps a PlanExercisePrescription (typically used for editing) to the ExerciseFormData structure.
 * Ensures IDs are converted to strings for form compatibility.
 */
export function mapPrescriptionToFormData(
  prescription: IntervalExercisePrescription
): ExerciseFormData {
  const variation = prescription.exerciseVariation;

  // Map ExerciseVariationParam to ExerciseParameterFormData
  const parameters: ExerciseParameterFormData[] = (variation?.parameters || []).map(
    (pt: ExerciseVariationParam) => ({
      parameterTypeId: pt.parameterTypeId,
      locked: pt.locked,
    }),
  );

  return {
    id: prescription.id, // Keep prescription ID
    variationId: variation?.id ?? undefined, // Match schema (number | undefined)
    // Use description from the base exercise
    name: variation?.exercise?.name ?? '',
    description: variation?.exercise?.description ?? '',
    sets: prescription.sets,
    reps: prescription.reps ?? defaultExerciseValues.reps, // Provide default if undefined
    rest: prescription.rest ?? undefined,
    rpe: prescription.rpe ?? undefined,
    duration: prescription.duration ?? undefined, // Re-add trailing comma
    parameters,
  };
}
