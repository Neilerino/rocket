import { useQuery } from '@tanstack/react-query';
import { PrescriptionService, PrescriptionFilters } from '../../api/prescriptions';
import { isApiError } from '../../api/errorHandler';
import { IntervalExercisePrescription } from '../../types';
import { createPrescriptionCacheKey } from './utils';

/**
 * Hook to fetch prescriptions with flexible filtering
 * @param filters Filter criteria (groupId, intervalId, etc.)
 * @param options Additional react-query options
 */
export const usePrescriptions = (filters: PrescriptionFilters = {}, options = {}) => {
  return useQuery({
    queryKey: createPrescriptionCacheKey({ filters }),
    queryFn: async () => {
      const response = await PrescriptionService.getPrescriptions(filters);
      if (isApiError(response)) {
        throw response.error;
      }
      const cacheValue = response.data || ([] as IntervalExercisePrescription[]);
      return cacheValue;
    },
    ...options,
  });
};
