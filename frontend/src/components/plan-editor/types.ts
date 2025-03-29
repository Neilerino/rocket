// Removed local Exercise type
/*
export interface Exercise {
  id: string;
  name: string;
  description: string;
  userId?: string;
  variations: any[]; // Add specific types here when needed
}
*/

// Removed local ParameterType type
/*
export interface ParameterType {
  id: string;
  name: string;
  dataType: 'number' | 'string' | 'boolean';
  defaultUnit?: string;
  minValue?: number;
  maxValue?: number;
}
*/

// Removed local ExerciseVariation type
/*
export interface ExerciseVariation {
  id: string;
  exerciseId: string;
  parameterTypeId: string;
}
*/

// Removed local ExercisePrescription type
/*
export interface ExercisePrescription {
  id?: string;
  exerciseId?: string;
  groupId: string;
  planIntervalId: string;
  sets: number;
  reps?: number;
  durationMinutes?: number;
  durationSeconds?: number;
  rest?: string;
  rpe?: number;
  parameters: Record<string, number>;
  lockedParameters?: Record<string, number>;
}
*/

// PlanInterval is kept for now, assuming it might be used elsewhere
export interface PlanInterval {
  id: number;
  planId: number;
  name: string;
  description?: string;
  duration: string; // interval
  order: number;
  groupCount: number;
}
