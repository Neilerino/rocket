import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PrescriptionService } from '../../api/prescriptions';
import { isApiError } from '../../api/errorHandler';
import { IntervalExercisePrescription, CreatePrescriptionDto } from '../../types';

const QUERY_KEY = 'prescriptions';

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
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEY, 'group', variables.groupId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEY, 'interval', variables.planIntervalId] 
      });
    }
  });
};

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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });
};
