export interface Exercise {
  id: string;
  name: string;
  description: string;
  userId?: string;
}

export interface ParameterType {
  id: string;
  name: string;
  dataType: string;
  defaultUnit: string;
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
  exerciseId: string;
  groupId: string;
  planIntervalId: string;
  rpe?: number;
  sets: number;
  reps?: number;
  duration?: string; // interval
  rest?: string; // interval
  parameters: Record<string, number>; // parameter_type_id -> value
}

export interface Group {
  id: string;
  name: string;
  description: string;
  userId?: string;
  exercises: ExercisePrescription[];
}

export interface PlanInterval {
  id: string;
  planId: string;
  name: string;
  duration: string; // interval
  order: number;
  groups: Group[];
}
