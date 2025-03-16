import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ExerciseFilters, ExerciseVariationFilters, ExerciseService } from '../../api/exercises';
import { isApiError } from '../../api/errorHandler';
import { Exercise, ExerciseVariation, CreateExerciseDto, UpdateExerciseDto, CreateExerciseVariationDto } from '../../types';
import { createExerciseCacheKey, createExerciseVariationCacheKey } from './utils';

export const useCreateExercise = ({ filters }: { filters: ExerciseFilters }) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (exerciseData: CreateExerciseDto) => {
      const response = await ExerciseService.createExercise(exerciseData);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as Exercise;
    },
    onSuccess: (exercise) => {
      queryClient.setQueryData(createExerciseCacheKey({ filters }), (old: Exercise[] | undefined) =>
        old ? [...old, exercise] : [exercise],
      );
    },
  });
};

export const useUpdateExercise = ({ filters }: { filters: ExerciseFilters }) => {
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
      await queryClient.cancelQueries({ queryKey: createExerciseCacheKey({ filters }) });
      const previousExercises = queryClient.getQueryData(createExerciseCacheKey({ filters }));
      
      queryClient.setQueryData(createExerciseCacheKey({ filters }), (old: Exercise[] | undefined) =>
        old
          ? old.map((e) => (e.id === updatedExercise.id ? { ...e, ...updatedExercise } : e))
          : undefined,
      );
      
      return { previousExercises };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousExercises) {
        queryClient.setQueryData(createExerciseCacheKey({ filters }), context.previousExercises);
      }
    },
  });
};

export const useDeleteExercise = ({ filters }: { filters: ExerciseFilters }) => {
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
      queryClient.setQueryData(createExerciseCacheKey({ filters }), (old: Exercise[] | undefined) =>
        old ? old.filter((e) => e.id !== id) : undefined,
      );
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: createExerciseCacheKey({ filters }) });
    },
  });
};

export const useCreateExerciseVariation = ({ filters }: { filters: ExerciseVariationFilters }) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ exerciseId, variationData }: { exerciseId: number; variationData: CreateExerciseVariationDto }) => {
      const response = await ExerciseService.createExerciseVariation(exerciseId, variationData);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as ExerciseVariation;
    },
    onSuccess: (variation) => {
      queryClient.setQueryData(createExerciseVariationCacheKey({ filters }), (old: ExerciseVariation[] | undefined) =>
        old ? [...old, variation] : [variation],
      );
    },
  });
};

export const useDeleteExerciseVariation = ({ filters }: { filters: ExerciseVariationFilters }) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await ExerciseService.deleteExerciseVariation(id);
      if (isApiError(response)) {
        throw response.error;
      }
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(createExerciseVariationCacheKey({ filters }), (old: ExerciseVariation[] | undefined) =>
        old ? old.filter((v) => v.id !== id) : undefined,
      );
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: createExerciseVariationCacheKey({ filters }) });
    },
  });
};
