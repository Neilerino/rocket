import { useQuery } from '@tanstack/react-query';
import { PlanService } from '../../api/plans';
import { isApiError } from '../../api/errorHandler';
import { Plan } from '../../types';

const QUERY_KEY = 'plans';

export const usePlans = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: async () => {
      const response = await PlanService.getPlans(filters);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as Plan[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const usePlanById = (planId: number, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, planId],
    queryFn: async () => {
      const response = await PlanService.getPlans({ id: planId });
      if (isApiError(response)) {
        throw response.error;
      }

      // Check if data exists and has at least one element
      if (!response.data || response.data.length === 0) {
        throw new Error(`Plan with ID ${planId} not found`);
      }

      return response.data[0] as Plan;
    },
    enabled: !!planId,
    ...options,
  });
};

export const usePlansByUserId = (userId: number, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'user', userId],
    queryFn: async () => {
      const response = await PlanService.getPlans({ userId });
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as Plan[];
    },
    enabled: !!userId,
    ...options,
  });
};
