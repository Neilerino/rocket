import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRequest, postRequest, putRequest, deleteRequest } from './requests';
import type { Exercise, CreateExerciseDto, UpdateExerciseDto } from './types';

const QUERY_KEY = 'exercises';

// API Functions
const getExercisesByUserId = async (userId: number) => {
  return getRequest<Exercise[]>(`/exercises/user/${userId}`);
};

const getExerciseById = async (id: number) => {
  return getRequest<Exercise>(`/exercises/${id}`);
};

const createExercise = async (newExercise: CreateExerciseDto) => {
  return postRequest<Exercise>('/exercises', newExercise);
};

const updateExercise = async ({ id, ...data }: UpdateExerciseDto & { id: number }) => {
  return putRequest<Exercise>(`/exercises/${id}`, data);
};

const deleteExercise = async (id: number) => {
  return deleteRequest<void>(`/exercises/${id}`);
};

// React Query Hooks
export const useExercisesByUserId = (userId: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'user', userId],
    queryFn: () => getExercisesByUserId(userId),
  });
};

export const useExerciseById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getExerciseById(id),
  });
};

export const useCreateExercise = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createExercise,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEY, 'user', variables.userId] 
      });
    },
  });
};

export const useUpdateExercise = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateExercise,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
  });
};

export const useDeleteExercise = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteExercise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
