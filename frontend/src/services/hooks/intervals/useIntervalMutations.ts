import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IntervalService } from '../../api/intervals';
import { isApiError } from '../../api/errorHandler';
import { PlanInterval, CreatePlanIntervalDto } from '../../types';
import { createCacheKey } from './utils';

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
        queryKey: [createCacheKey({ planId: variables.planId })],
      });
    },
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
      await queryClient.cancelQueries({
        queryKey: [createCacheKey({ intervalId: updatedInterval.id })],
      });
      const previousInterval = queryClient.getQueryData([
        createCacheKey({ intervalId: updatedInterval.id }),
      ]);

      queryClient.setQueryData(
        [createCacheKey({ intervalId: updatedInterval.id })],
        (old: PlanInterval | undefined) => (old ? { ...old, ...updatedInterval } : undefined),
      );

      return { previousInterval };
    },
    onError: (_err, variables, context) => {
      if (context?.previousInterval) {
        queryClient.setQueryData(
          [createCacheKey({ intervalId: variables.id })],
          context.previousInterval,
        );
      }
    },
    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: [createCacheKey({ planId: data.planId })] });
        queryClient.invalidateQueries({ queryKey: [createCacheKey({ intervalId: data.id })] });
      }
    },
  });
};

export const useDeleteInterval = (planId: number) => {
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
      queryClient.invalidateQueries({ queryKey: [createCacheKey({ planId: planId })] });
    },
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
        queryKey: [createCacheKey({ planId: variables.planId })],
      });
    },
  });
};
