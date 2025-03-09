import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IntervalService } from '../../api/intervals';
import { isApiError } from '../../api/errorHandler';
import { PlanInterval, CreatePlanIntervalDto } from '../../types';

const QUERY_KEY = 'intervals';

export const useCreateInterval = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (intervalData: CreatePlanIntervalDto) => {
      const response = await IntervalService.createInterval(intervalData);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as PlanInterval;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEY, 'plan', variables.planId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['plans', variables.planId]
      });
    }
  });
};

export const useUpdateInterval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CreatePlanIntervalDto> & { id: number }) => {
      const response = await IntervalService.updateInterval(id, data);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as PlanInterval;
    },
    onMutate: async (updatedInterval) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, updatedInterval.id] });
      const previousInterval = queryClient.getQueryData([QUERY_KEY, updatedInterval.id]);
      
      queryClient.setQueryData([QUERY_KEY, updatedInterval.id], 
        (old: PlanInterval | undefined) => old ? { ...old, ...updatedInterval } : undefined);
        
      return { previousInterval };
    },
    onError: (_err, variables, context) => {
      if (context?.previousInterval) {
        queryClient.setQueryData(
          [QUERY_KEY, variables.id],
          context.previousInterval
        );
      }
    },
    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'plan', data.planId] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.id] });
      }
    }
  });
};

export const useDeleteInterval = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await IntervalService.deleteInterval(id);
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

export const useReorderIntervals = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ planId, intervalIds }: { planId: number; intervalIds: number[] }) => {
      const response = await IntervalService.reorderIntervals(planId, intervalIds);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as PlanInterval[];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEY, 'plan', variables.planId] 
      });
    }
  });
};
