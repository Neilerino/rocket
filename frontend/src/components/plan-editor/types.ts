export interface Exercise {
  id: string;
  name: string;
  description: string;
  userId?: string;
  variations: any[]; // Add specific types here when needed
}

export interface ParameterType {
  id: string;
  name: string;
  dataType: 'number' | 'string' | 'boolean';
  defaultUnit?: string;
  minValue?: number;
  maxValue?: number;
}

export interface ExerciseVariation {
  id: string;
  exerciseId: string;
  parameterTypeId: string;
}

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

export interface Group {
  id: string;
  name: string;
  frequency: string;
  exercises: ExercisePrescription[];
  description?: string;
  _isAddingNewGroup?: boolean;
}

export interface PlanInterval {
  id: number;
  planId: number;
  name: string;
  description?: string;
  duration: string; // interval
  order: number;
  groups: Group[];
  groupCount: number;
}
