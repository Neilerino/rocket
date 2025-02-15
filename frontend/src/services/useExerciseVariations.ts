import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRequest, postRequest, deleteRequest } from './requests';
import type { ExerciseVariation, CreateExerciseVariationDto } from './types';

const QUERY_KEY = 'exerciseVariations';

// API Functions
const getVariationsByExerciseId = async (exerciseId: number) => {
  return getRequest<ExerciseVariation[]>(`/exercise-variations/exercise/${exerciseId}`);
};

const getVariationById = async (id: number) => {
  return getRequest<ExerciseVariation>(`/exercise-variations/${id}`);
};

const createVariation = async (newVariation: CreateExerciseVariationDto) => {
  return postRequest<ExerciseVariation>('/exercise-variations', newVariation);
};

const deleteVariation = async (id: number) => {
  return deleteRequest<void>(`/exercise-variations/${id}`);
};

// React Query Hooks
export const useVariationsByExerciseId = (exerciseId: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'exercise', exerciseId],
    queryFn: () => getVariationsByExerciseId(exerciseId),
  });
};

export const useVariationById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getVariationById(id),
  });
};

export const useCreateVariation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createVariation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEY, 'exercise', variables.exerciseId] 
      });
    },
  });
};

export const useDeleteVariation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteVariation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
