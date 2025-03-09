import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ExerciseVariationService } from '../../api/exerciseVariations';
import { isApiError } from '../../api/errorHandler';
import { ExerciseVariation, CreateExerciseVariationDto } from '../../types';

const QUERY_KEY = 'exerciseVariations';

export const useCreateVariation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (variationData: CreateExerciseVariationDto) => {
      const response = await ExerciseVariationService.createVariation(variationData);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as ExerciseVariation;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEY, 'exercise', variables.exerciseId] 
      });
    }
  });
};

export const useDeleteVariation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await ExerciseVariationService.deleteVariation(id);
      if (isApiError(response)) {
        throw response.error;
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });
};
