import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ParameterTypeService, CreateParameterTypeDto, ParameterTypeFilters } from '../../api';
import { ParameterType } from '../../types';
import { createParameterTypeCacheKey } from './utils';
import { isApiError } from '../../api/errorHandler';

/**
 * React Query hook for creating a new ParameterType.
 * Updates the parameter types list cache on success.
 * @param filters - Optional filters used for the list query key to update.
 * @returns Mutation result object.
 */
export const useCreateParameterType = (filters?: ParameterTypeFilters) => {
  const queryClient = useQueryClient();
  const queryKey = createParameterTypeCacheKey({ filters }); // Generate the key to update

  return useMutation({
    mutationFn: async (data: CreateParameterTypeDto) => {
      const response = await ParameterTypeService.createParameterType(data);
      if (isApiError(response)) {
        throw response.error;
      }
      return response.data as ParameterType;
    },
    onSuccess: (newParameterType) => {
      // Instead of invalidating, directly update the cache using the generated key
      queryClient.setQueryData<ParameterType[]>(queryKey, (old: ParameterType[] | undefined) =>
        old ? [...old, newParameterType] : [newParameterType],
      );
    },
    onError: (error) => {
      // Handle error, e.g., show a notification
      console.error('Error creating parameter type:', error);
    },
  });
};
