import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRequest, postRequest, putRequest, deleteRequest } from './requests';
import type { Plan, CreatePlanDto, UpdatePlanDto } from './types';

const QUERY_KEY = 'plans';

// API Functions
const getPlans = async (userId: number) => {
  return getRequest<Plan[]>(`/plans/user/${userId}`);
};

const getPlanById = async (id: number) => {
  return getRequest<Plan>(`/plans/${id}`);
};

const createPlan = async (newPlan: CreatePlanDto) => {
  return postRequest<Plan>('/plans', newPlan);
};

const updatePlan = async ({ id, ...data }: UpdatePlanDto & { id: number }) => {
  return putRequest<Plan>(`/plans/${id}`, data);
};

const deletePlan = async (id: number) => {
  return deleteRequest<void>(`/plans/${id}`);
};

// React Query Hooks
export const usePlans = (userId: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'user', userId],
    queryFn: () => getPlans(userId),
  });
};

export const usePlanById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getPlanById(id),
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updatePlan,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
