import {
  ExerciseVariation,
  IntervalExercisePrescription,
  ExerciseVariationParam,
} from '@/services/types';
import {
  ExerciseFormData,
  ExerciseParameterFormData,
  defaultExerciseValues,
} from './useExerciseForm';

/**
 * Maps an ExerciseVariation (typically used for reusing exercises) to the ExerciseFormData structure.
 * Ensures IDs are converted to strings for form compatibility.
 */
export function mapVariationToFormData(variation: ExerciseVariation): ExerciseFormData {
  // Map ExerciseVariationParam to ExerciseParameterFormData
  const parameters: ExerciseParameterFormData[] = (variation.parameters || []).map(
    (pt: ExerciseVariationParam) => ({
      parameterTypeId: pt.parameterTypeId,
      name: pt.parameterType.name,
      dataType: pt.parameterType.dataType,
      defaultUnit: pt.parameterType.defaultUnit,
      minValue: pt.parameterType.minValue ?? null,
      maxValue: pt.parameterType.maxValue ?? null,
      locked: pt.locked,
    }),
  );

  return {
    id: null, // Match schema (number | undefined)
    variationId: variation.id,
    // Use description from the base exercise
    name: variation.exercise?.name ?? '',
    description: variation.exercise?.description ?? '',
    sets: 1, // Default values for prescription fields
    reps: 10,
    restMinutes: null,
    restSeconds: null,
    rpe: null,
    subReps: null,
    subWorkDurationMinutes: null,
    subWorkDurationSeconds: null,
    subRestDurationMinutes: null,
    subRestDurationSeconds: null,
    parameters,
  };
}

/**
 * Maps a PlanExercisePrescription (typically used for editing) to the ExerciseFormData structure.
 * Ensures IDs are converted to strings for form compatibility.
 */
export function mapPrescriptionToFormData(
  prescription: IntervalExercisePrescription,
): ExerciseFormData {
  const variation = prescription.exerciseVariation;

  // Map ExerciseVariationParam to ExerciseParameterFormData
  const parameters: ExerciseParameterFormData[] = (variation?.parameters || []).map(
    (pt: ExerciseVariationParam) => ({
      parameterTypeId: pt.parameterTypeId,
      name: pt.parameterType.name,
      dataType: pt.parameterType.dataType,
      defaultUnit: pt.parameterType.defaultUnit,
      minValue: pt.parameterType.minValue ?? null,
      maxValue: pt.parameterType.maxValue ?? null,
      locked: pt.locked,
    }),
  );

  // Parse duration and rest time from string format "# minutes # seconds" to numbers
  let durationMinutes = null,
    durationSeconds = null;
  if (prescription.duration) {
    const durationMatch = prescription.duration.match(/(\d+)\s*minutes?\s*(?:(\d+)\s*seconds?)?/);
    if (durationMatch) {
      durationMinutes = parseInt(durationMatch[1], 10) || 0;
      durationSeconds = durationMatch[2] ? parseInt(durationMatch[2], 10) : 0;
    }
  }

  let restMinutes = null,
    restSeconds = null;
  if (prescription.rest) {
    const restMatch = prescription.rest.match(/(\d+)\s*minutes?\s*(?:(\d+)\s*seconds?)?/);
    if (restMatch) {
      restMinutes = parseInt(restMatch[1], 10) || 0;
      restSeconds = restMatch[2] ? parseInt(restMatch[2], 10) : 0;
    }
  }

  return {
    id: prescription.id, // Keep prescription ID
    variationId: variation?.id ?? null, // Match schema (number | undefined)
    // Use description from the base exercise
    name: variation?.exercise?.name ?? '',
    description: variation?.exercise?.description ?? '',
    sets: prescription.sets,
    reps: prescription.reps ?? defaultExerciseValues.reps, // Provide default if undefined
    restMinutes: restMinutes,
    restSeconds: restSeconds,
    rpe: prescription.rpe ?? null,
    durationMinutes: durationMinutes,
    durationSeconds: durationSeconds,
    parameters,
  };
}
