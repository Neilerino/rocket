import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlanService } from '../../api/plans';
import { isApiError } from '../../api/errorHandler';
import { Plan, CreatePlanDto, UpdatePlanDto } from '../../types';

const QUERY_KEY = 'plans';

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (planData: CreatePlanDto) => {
      const response = await PlanService.createPlan(planData);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as Plan;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'user', variables.userId] });
    }
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdatePlanDto & { id: number }) => {
      const response = await PlanService.updatePlan(id, data);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as Plan;
    },
    onMutate: async (updatedPlan) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, updatedPlan.id] });
      const previousPlan = queryClient.getQueryData([QUERY_KEY, updatedPlan.id]);
      
      queryClient.setQueryData([QUERY_KEY, updatedPlan.id], 
        (old: Plan | undefined) => old ? { ...old, ...updatedPlan } : undefined);
        
      return { previousPlan };
    },
    onError: (_err, variables, context) => {
      if (context?.previousPlan) {
        queryClient.setQueryData(
          [QUERY_KEY, variables.id],
          context.previousPlan
        );
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    }
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await PlanService.deletePlan(id);
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
