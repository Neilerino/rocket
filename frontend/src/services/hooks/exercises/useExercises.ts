import { useQuery } from '@tanstack/react-query';
import { ExerciseFilters, ExerciseVariationFilters, ExerciseService } from '../../api/exercises';
import { isApiError } from '../../api/errorHandler';
import { Exercise, ExerciseVariation } from '../../types';
import { createExerciseCacheKey, createExerciseVariationCacheKey } from './utils';

/**
 * Hook to fetch exercises with flexible filtering
 * @param filters Filter criteria (id, userId, planId, etc.)
 * @param options Additional react-query options
 */
export const useExercises = (filters: ExerciseFilters = {}, options = {}) => {
  return useQuery({
    queryKey: createExerciseCacheKey({ filters }),
    queryFn: async () => {
      const response = await ExerciseService.getExercises(filters);
      if (isApiError(response)) {
        throw response.error;
      }
      const cacheValue = response.data || ([] as Exercise[]);
      return cacheValue;
    },
    ...options,
  });
};

/**
 * Hook to fetch exercise variations with flexible filtering
 * @param filters Filter criteria (exerciseId, variationId, userId, etc.)
 * @param options Additional react-query options
 */
export const useExerciseVariations = (filters: ExerciseVariationFilters = {}, options = {}) => {
  return useQuery({
    queryKey: createExerciseVariationCacheKey({ filters }),
    queryFn: async () => {
      const response = await ExerciseService.getExerciseVariations(filters);
      if (isApiError(response)) {
        throw response.error;
      }
      const cacheValue = response.data || ([] as ExerciseVariation[]);
      return cacheValue;
    },
    ...options,
  });
};

/**
 * Hook to fetch exercises by user ID
 * @param userId User ID
 * @param options Additional react-query options
 */
export const useExercisesByUserId = (userId: number, options = {}) => {
  return useExercises({ userId }, { enabled: !!userId, ...options });
};
