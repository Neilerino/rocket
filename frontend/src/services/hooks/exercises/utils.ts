import { ExerciseFilters, ExerciseVariationFilters } from '@/services/api/exercises';

export const QUERY_KEY = 'exercises';
export const VARIATIONS_QUERY_KEY = 'exercise-variations';

export const createExerciseCacheKey = (args: { filters: ExerciseFilters }) => 
  [QUERY_KEY, args.filters];

export const createExerciseVariationCacheKey = (args: { filters: ExerciseVariationFilters }) => 
  [VARIATIONS_QUERY_KEY, args.filters];
