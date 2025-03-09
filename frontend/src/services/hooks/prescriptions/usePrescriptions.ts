import { useQuery } from '@tanstack/react-query';
import { PrescriptionService } from '../../api/prescriptions';
import { isApiError } from '../../api/errorHandler';
import { IntervalExercisePrescription } from '../../types';

const QUERY_KEY = 'prescriptions';

export const usePrescriptionsByGroupId = (groupId: number, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'group', groupId],
    queryFn: async () => {
      const response = await PrescriptionService.getPrescriptionsByGroupId(groupId);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as IntervalExercisePrescription[];
    },
    enabled: !!groupId,
    ...options
  });
};

export const usePrescriptionsByIntervalId = (intervalId: number, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'interval', intervalId],
    queryFn: async () => {
      const response = await PrescriptionService.getPrescriptionsByIntervalId(intervalId);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as IntervalExercisePrescription[];
    },
    enabled: !!intervalId,
    ...options
  });
};
