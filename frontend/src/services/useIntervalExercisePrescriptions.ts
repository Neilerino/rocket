import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRequest, postRequest, deleteRequest } from './requests';
import type { IntervalExercisePrescription, CreatePrescriptionDto } from './types';

const QUERY_KEY = 'prescriptions';

// API Functions
const getPrescriptionsByGroupId = async (groupId: number) => {
  return getRequest<IntervalExercisePrescription[]>(`/interval-exercise-prescriptions/group/${groupId}`);
};

const getPrescriptionsByIntervalId = async (intervalId: number) => {
  return getRequest<IntervalExercisePrescription[]>(`/interval-exercise-prescriptions/interval/${intervalId}`);
};

const createPrescription = async (newPrescription: CreatePrescriptionDto) => {
  return postRequest<IntervalExercisePrescription>('/interval-exercise-prescriptions', newPrescription);
};

const deletePrescription = async (id: number) => {
  return deleteRequest<void>(`/interval-exercise-prescriptions/${id}`);
};

// React Query Hooks
export const usePrescriptionsByGroupId = (groupId: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'group', groupId],
    queryFn: () => getPrescriptionsByGroupId(groupId),
  });
};

export const usePrescriptionsByIntervalId = (intervalId: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'interval', intervalId],
    queryFn: () => getPrescriptionsByIntervalId(intervalId),
  });
};

export const useCreatePrescription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPrescription,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEY, 'group', variables.groupId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEY, 'interval', variables.planIntervalId] 
      });
    },
  });
};

export const useDeletePrescription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
