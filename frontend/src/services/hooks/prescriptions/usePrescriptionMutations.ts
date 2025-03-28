import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PrescriptionService } from '../../api/prescriptions';
import { isApiError } from '../../api/errorHandler';
import { IntervalExercisePrescription, CreatePrescriptionDto } from '../../types';
import { createPrescriptionCacheKey } from './utils';

/**
 * Hook for creating a new prescription
 */
export const useCreatePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prescriptionData: CreatePrescriptionDto) => {
      const response = await PrescriptionService.createPrescription(prescriptionData);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as IntervalExercisePrescription;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries

      throw new Error('Not implemented');
      queryClient.invalidateQueries({
        queryKey: createPrescriptionCacheKey({
          filters: { groupId: variables.groupId },
        }),
      });

      queryClient.invalidateQueries({
        queryKey: createPrescriptionCacheKey({
          filters: { intervalId: variables.planIntervalId },
        }),
      });

      // Invalidate all prescriptions queries
      queryClient.invalidateQueries({
        queryKey: createPrescriptionCacheKey(),
      });
    },
  });
};

/**
 * Hook for deleting a prescription
 */
export const useDeletePrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await PrescriptionService.deletePrescription(id);
      if (isApiError(response)) {
        throw response.error;
      }
      return id;
    },
    onSuccess: () => {
      // Invalidate all prescription queries
      queryClient.invalidateQueries({
        queryKey: createPrescriptionCacheKey(),
      });
    },
  });
};
