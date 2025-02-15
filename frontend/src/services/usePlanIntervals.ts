import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRequest, postRequest, deleteRequest } from './requests';
import type { PlanInterval, CreatePlanIntervalDto } from './types';

const QUERY_KEY = 'planIntervals';

// API Functions
const getPlanIntervals = async (planId: number) => {
  return getRequest<PlanInterval[]>(`/plan-intervals/plan/${planId}`);
};

const createPlanInterval = async (newInterval: CreatePlanIntervalDto) => {
  return postRequest<PlanInterval>('/plan-intervals', newInterval);
};

const deletePlanInterval = async (id: number) => {
  return deleteRequest<void>(`/plan-intervals/${id}`);
};

// React Query Hooks
export const usePlanIntervals = (planId: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'plan', planId],
    queryFn: () => getPlanIntervals(planId),
  });
};

export const useCreatePlanInterval = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPlanInterval,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEY, 'plan', variables.planId] 
      });
    },
  });
};

export const useDeletePlanInterval = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePlanInterval,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
