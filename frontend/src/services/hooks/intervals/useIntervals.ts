import { useQuery } from '@tanstack/react-query';
import { IntervalService } from '../../api/intervals';
import { isApiError } from '../../api/errorHandler';
import { PlanInterval } from '../../types';

const QUERY_KEY = 'intervals';

export const useIntervalsByPlanId = (planId: number, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'plan', planId],
    queryFn: async () => {
      const response = await IntervalService.getIntervalsByPlanId(planId);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as PlanInterval[];
    },
    enabled: !!planId,
    ...options
  });
};

export const useIntervalById = (intervalId: number, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, intervalId],
    queryFn: async () => {
      const response = await IntervalService.getIntervalById(intervalId);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as PlanInterval;
    },
    enabled: !!intervalId,
    ...options
  });
};
