import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ExerciseService } from '../../api/exercises';
import { isApiError } from '../../api/errorHandler';
import { Exercise, CreateExerciseDto, UpdateExerciseDto } from '../../types';

const QUERY_KEY = 'exercises';

export const useCreateExercise = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (exerciseData: CreateExerciseDto) => {
      const response = await ExerciseService.createExercise(exerciseData);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as Exercise;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEY, 'user', variables.userId] 
      });
    }
  });
};

export const useUpdateExercise = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateExerciseDto & { id: number }) => {
      const response = await ExerciseService.updateExercise(id, data);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as Exercise;
    },
    onMutate: async (updatedExercise) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, updatedExercise.id] });
      const previousExercise = queryClient.getQueryData([QUERY_KEY, updatedExercise.id]);
      
      queryClient.setQueryData([QUERY_KEY, updatedExercise.id], 
        (old: Exercise | undefined) => old ? { ...old, ...updatedExercise } : undefined);
        
      return { previousExercise };
    },
    onError: (_err, variables, context) => {
      if (context?.previousExercise) {
        queryClient.setQueryData(
          [QUERY_KEY, variables.id],
          context.previousExercise
        );
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    }
  });
};

export const useDeleteExercise = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await ExerciseService.deleteExercise(id);
      if (isApiError(response)) {
        throw response.error;
      }
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.removeQueries({ queryKey: [QUERY_KEY, id] });
    }
  });
};
