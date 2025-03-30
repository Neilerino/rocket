import { useQuery } from '@tanstack/react-query';
import { ParameterTypeService, ParameterTypeFilters } from '../../api';
import { ParameterType } from '../../types';
import { createParameterTypeCacheKey } from './utils';
import { isApiError } from '../../api/errorHandler';

/**
 * React Query hook to fetch parameter types based on filters.
 * @param filters - Optional filters for fetching parameter types, including pagination.
 * @returns Query result object containing parameter types data, loading state, error, etc.
 */
export const useParameterTypes = (filters: ParameterTypeFilters) => {
  const queryKey = createParameterTypeCacheKey({ filters });

  return useQuery<ParameterType[], Error>({
    queryKey: queryKey,
    queryFn: async () => {
      const response = await ParameterTypeService.getParameterTypes(filters);
      if (isApiError(response)) {
        throw response.error;
      }
      const cacheValue = response.data || ([] as ParameterType[]);
      return cacheValue;
    },
  });
};
