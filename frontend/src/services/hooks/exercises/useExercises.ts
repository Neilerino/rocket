import { useQuery } from '@tanstack/react-query';
import { ExerciseService } from '../../api/exercises';
import { isApiError } from '../../api/errorHandler';
import { Exercise } from '../../types';

const QUERY_KEY = 'exercises';

export const useExercisesByUserId = (userId: number, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'user', userId],
    queryFn: async () => {
      const response = await ExerciseService.getExercisesByUserId(userId);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as Exercise[];
    },
    enabled: !!userId,
    ...options
  });
};

export const useExerciseById = (id: number, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await ExerciseService.getExerciseById(id);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as Exercise;
    },
    enabled: !!id,
    ...options
  });
};
