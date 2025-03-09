import { useQuery } from '@tanstack/react-query';
import { ExerciseVariationService } from '../../api/exerciseVariations';
import { isApiError } from '../../api/errorHandler';
import { ExerciseVariation } from '../../types';

const QUERY_KEY = 'exerciseVariations';

export const useVariationsByExerciseId = (exerciseId: number, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'exercise', exerciseId],
    queryFn: async () => {
      const response = await ExerciseVariationService.getVariationsByExerciseId(exerciseId);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as ExerciseVariation[];
    },
    enabled: !!exerciseId,
    ...options
  });
};

export const useVariationById = (id: number, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await ExerciseVariationService.getVariationById(id);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as ExerciseVariation;
    },
    enabled: !!id,
    ...options
  });
};
