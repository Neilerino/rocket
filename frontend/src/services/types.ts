// Common Types
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

// Plan Types
export interface Plan extends BaseEntity {
  name: string;
  description: string;
  duration?: number;
  schedule?: string;
  userId: number;
}

export interface CreatePlanDto {
  name: string;
  description: string;
  userId: number;
  duration?: number;
  schedule?: string;
}

export interface UpdatePlanDto {
  name: string;
  description: string;
}

// Group Types
export interface Group extends BaseEntity {
  name: string;
  description: string;
  userId: number;
}

export interface CreateGroupDto {
  name: string;
  description: string;
}

export interface UpdateGroupDto {
  name: string;
  description: string;
}

// Plan Interval Types
export interface PlanInterval extends BaseEntity {
  planId: number;
  name: string;
  description: string;
  duration: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  groupCount: number;
}

export interface CreatePlanIntervalDto {
  planId: number;
  name: string;
  description: string;
  duration: string;
  order: number;
}

// Exercise Types
export interface Exercise extends BaseEntity {
  name: string;
  description: string;
  userId: number;
}

export interface CreateExerciseDto {
  name: string;
  description: string;
  userId: number;
}

export interface UpdateExerciseDto {
  name: string;
  description: string;
}

// Exercise Variation Types
export interface ParameterType {
  id: number;
  name: string;
  dataType: string;
  defaultUnit: string;
  minValue?: number;
  maxValue?: number;
}

export interface ExerciseVariation extends BaseEntity {
  exerciseId: number;
  parameterTypeId: number;
  exercise?: Exercise;
  parameterType?: ParameterType;
}

export interface CreateExerciseVariationDto {
  exerciseId: number;
  name: string;
  dataType: string;
  defaultUnit: string;
  minValue?: number;
  maxValue?: number;
  parameterTypeId: number;
}

// Interval Exercise Prescription Types
export interface IntervalExercisePrescription extends BaseEntity {
  groupId: number;
  exerciseVariationId: number;
  planIntervalId: number;
  rpe?: number;
  sets: number;
  reps?: number;
  duration?: number;
  rest?: number;
  exerciseVariation?: ExerciseVariation;
}

export interface CreatePrescriptionDto {
  groupId: number;
  exerciseVariationId: number;
  planIntervalId: number;
  rpe?: number;
  sets: number;
  reps?: number;
  duration?: number;
  rest?: number;
}
