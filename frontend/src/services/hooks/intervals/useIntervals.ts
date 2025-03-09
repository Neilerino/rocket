import { useQuery } from '@tanstack/react-query';
import { IntervalService } from '../../api/intervals';
import { isApiError } from '../../api/errorHandler';
import { PlanInterval } from '../../types';
import { createCacheKey } from './utils';

/**
 * Hook to fetch intervals with flexible filtering
 * @param filters Filter criteria (planId, id, etc.)
 * @param options Additional react-query options
 */
export const useIntervals = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: [createCacheKey({ filters })],
    queryFn: async () => {
      const response = await IntervalService.getIntervals(filters);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as PlanInterval[];
    },
    ...options,
  });
};

/**
 * Hook to fetch intervals for a specific plan
 * @param planId The ID of the plan
 * @param options Additional react-query options
 */
export const useIntervalsByPlanId = (planId: number, options = {}) => {
  return useIntervals(
    { planId },
    {
      enabled: !!planId,
      ...options,
    },
  );
};

/**
 * Hook to fetch a specific interval by ID
 * @param intervalId The ID of the interval
 * @param options Additional react-query options
 */
export const useIntervalById = (intervalId: number, options = {}) => {
  return useQuery({
    queryKey: [createCacheKey({ intervalId })],
    queryFn: async () => {
      const response = await IntervalService.getIntervals({ id: intervalId });
      if (isApiError(response)) {
        throw response.error;
      }
      // Since we're querying by ID, we expect a single result
      const intervals = response.data as PlanInterval[];
      if (intervals && intervals.length > 0) {
        return intervals[0];
      }
      throw new Error(`Interval with ID ${intervalId} not found`);
    },
    enabled: !!intervalId,
    ...options,
  });
};
