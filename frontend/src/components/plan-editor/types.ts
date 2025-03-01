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
}

export interface Group {
  id: string;
  name: string;
  frequency?: string;
  description?: string;
  userId?: string;
  exercises: ExercisePrescription[];
  _isAddingNewGroup?: boolean; // Flag to track which interval is adding a new group
}

export interface PlanInterval {
  id: string;
  planId: string;
  name: string;
  duration: string; // interval
  order: number;
  groups: Group[];
}
